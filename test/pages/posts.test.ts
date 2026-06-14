import { describe, expect, it } from 'vitest'
import { setup, url } from '@nuxt/test-utils'
import { mockPostsPage0, mockPostsPage1, mockPostsPageWithOfflineMedia } from './posts.mock-data'
import { defaultSetupConfig, useTrackedPageFactory } from '../helper'

function decodeImgproxySourceUrl(src: string) {
  const encodedSource = src.split('/').pop()

  if (!encodedSource) {
    return null
  }

  const base64 = encodedSource.replace(/-/g, '+').replace(/_/g, '/')
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  return Buffer.from(paddedBase64, 'base64').toString('utf8')
}

function expectImageSrcToReference(src: string | null, expectedUrl: string) {
  expect(src).toBeTruthy()

  if (src?.startsWith('https://imgproxy2.r34.app/')) {
    expect(decodeImgproxySourceUrl(src)).toBe(`http://nginx-proxy/proxy?url=${expectedUrl}`)
    return
  }

  expect(src).toBe(expectedUrl)
}

type TrackedPage = Awaited<ReturnType<ReturnType<typeof useTrackedPageFactory>>>

async function getPostImageSrc(page: TrackedPage, testId: string) {
  try {
    await page.waitForFunction(
      (id) => document.querySelector(`[data-testid="${id}"] img`)?.getAttribute('src'),
      testId,
      { timeout: 10000 }
    )
  } catch (error) {
    const visiblePostIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-testid^="safebooru.org-"], [data-testid^="rule34.xxx-"]'))
        .map((element) => ({
          id: element.getAttribute('data-testid'),
          hasImage: element.querySelector('img') != null,
          text: element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 240),
          html: element.innerHTML.slice(0, 1000)
        }))
        .slice(0, 20)
    )

    throw new Error(`Post image not found for ${testId}. Visible posts: ${JSON.stringify(visiblePostIds)}`, {
      cause: error
    })
  }

  return page.evaluate((id) => document.querySelector(`[data-testid="${id}"] img`)?.getAttribute('src') ?? null, testId)
}

describe('/', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()

  it('sets mockdata correctly', async () => {
    // Make sure mockPostsPage0 and mockPostsPage1 have different first posts
    expect(mockPostsPage0.data[0].id).not.toBe(mockPostsPage1.data[0].id)
  })

  describe('Basic', async () => {
    it('renders page', async () => {
      // Arrange
      const page = await createTrackedPage('/posts/safebooru.org')

      // Act
      const headerElement = page.getByRole('heading', { name: 'Posts', exact: true })

      // Assert
      await headerElement.isVisible()
    }, 30000)

    it('does not emit post page hydration or effect-scope warnings', async () => {
      // Arrange
      const page = await createTrackedPage()
      const warningSignatures = [
        'Hydration node mismatch',
        'Hydration children mismatch',
        'Hydration style mismatch',
        'Hydration completed but contains mismatches',
        'useQuery() should only be used inside',
        'onScopeDispose() is called when there is no active effect scope'
      ]
      const warnings: string[] = []

      page.on('console', (message) => {
        const text = message.text()

        if (warningSignatures.some((signature) => text.includes(signature))) {
          warnings.push(text)
        }
      })

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      // Assert
      expect(warnings).toEqual([])
    }, 30000)

    it('renders a loader', async () => {
      // Arrange
      const page = await createTrackedPage('/posts/safebooru.org')
      let releasePostsResponse: (() => void) | undefined
      const holdPostsResponse = new Promise<void>((resolve) => {
        releasePostsResponse = resolve
      })

      await page.route(
        '**/booru/rule34.xxx/posts*',
        async (route) => {
          await holdPostsResponse

          await route.fulfill({
            status: 200,
            json: mockPostsPage0
          })
        },
        { times: 1 }
      )

      // Act
      await page.getByTestId('domain-selector').waitFor({ state: 'visible' })
      await page.waitForLoadState('networkidle')
      await page.getByTestId('domain-selector').click({ force: true })
      const rule34Option = page.getByRole('option', { name: /rule34\.xxx/i })
      await rule34Option.waitFor({ state: 'visible' })
      await rule34Option.click({ force: true })

      const loaderElement = page.getByTestId('posts-loader')

      // Assert
      await loaderElement.waitFor({ state: 'visible', timeout: 10000 })
      expect(await loaderElement.isVisible()).toBe(true)

      releasePostsResponse?.()
      await page.getByTestId(`rule34.xxx-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })
    }, 60000)

    it('shows no results', async () => {
      // Arrange
      const page = await createTrackedPage()
      // Act
      await page.goto(url('/posts/safebooru.org?tags=empty_test'), { waitUntil: 'domcontentloaded' })

      const titleElement = page.getByRole('heading', { name: /no results/i })

      // Assert
      await titleElement.isVisible()
    }, 30000)
  })

  describe('Posts', async () => {
    it('renders posts', async () => {
      // Arrange
      const page = await createTrackedPage('/posts/safebooru.org')

      const firstPostTestId = `safebooru.org-${mockPostsPage0.data[0].id}`
      const firstPost = page.getByTestId(firstPostTestId).first()

      // Assert DOM
      await firstPost.waitFor({ state: 'visible' })

      expectImageSrcToReference(await getPostImageSrc(page, firstPostTestId), mockPostsPage0.data[0].low_res_file.url)

      await firstPost.getByRole('button', { name: /tags/i }).click()

      // BottomSheet renders outside post row subtree; assert one known tag appears
      await page.getByRole('button', { name: /1girl/i }).first().waitFor({ state: 'visible', timeout: 10000 })
    }, 30000)

    it('renders URL source menu labels', async () => {
      const page = await createTrackedPage()
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

      const firstPost = page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`)
      const sourceButton = firstPost.getByLabel('Open post source options')

      await firstPost.waitFor({ state: 'visible', timeout: 10000 })
      await sourceButton.waitFor({ state: 'visible', timeout: 10000 })
      await sourceButton.click({ timeout: 10000 })

      await page.getByText('static.miraheze.org').waitFor({ state: 'visible', timeout: 10000 })
    }, 30000)

    // TODO: Test that verifies if a post with 'unknown' media type is not rendered

    it.todo('proxies media when media failed to load', async () => {})

    it('renders warning when media failed to load', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/posts/safebooru.org?tags=offline_test'), { waitUntil: 'domcontentloaded' })

      // Assert
      const postWithWarning = page.getByTestId(`safebooru.org-${mockPostsPageWithOfflineMedia.data[0].id}`).first()
      await postWithWarning.waitFor({ state: 'visible' })

      await postWithWarning.locator('img').first().dispatchEvent('error')
      await page.waitForFunction(() => document.body.textContent?.includes('Error loading media'))
      expect(await postWithWarning.textContent()).toContain('Error loading media')
    }, 20000)
  })

  describe('Pagination', async () => {
    it('loads more posts', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

      // First page is visible
      await page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      // Trigger load-more deterministically; the virtualizer updates across animation frames.
      await page.evaluate(async () => {
        for (let i = 0; i < 20; i++) {
          window.scrollTo(0, document.documentElement.scrollHeight)
          window.dispatchEvent(new Event('scroll'))
          await new Promise((resolve) => requestAnimationFrame(resolve))
        }
      })
      await page.waitForURL((u) => u.pathname === '/posts/safebooru.org' && u.searchParams.get('page') === '1')

      // Assert DOM
      await page.getByText('Nothing more to load').waitFor({ state: 'visible' })
    }, 30000)

    it('keeps scroll position when loading more posts', async () => {
      const page = await createTrackedPage()
      let releaseNextPageResponse: (() => void) | undefined
      const holdNextPageResponse = new Promise<void>((resolve) => {
        releaseNextPageResponse = resolve
      })

      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      await page.route(
        '**/booru/gelbooru/posts*pageID=1*',
        async (route) => {
          await holdNextPageResponse

          await route.fulfill({
            status: 200,
            json: {
              ...mockPostsPage1,
              links: {
                ...mockPostsPage1.links,
                next: null
              }
            }
          })
        },
        { times: 1 }
      )

      await page.evaluate(async () => {
        for (let i = 0; i < 20; i++) {
          window.scrollTo(0, document.documentElement.scrollHeight)
          window.dispatchEvent(new Event('scroll'))
          await new Promise((resolve) => requestAnimationFrame(resolve))
        }
      })

      await page.waitForURL((u) => u.pathname === '/posts/safebooru.org' && u.searchParams.get('page') === '1')
      await page.waitForTimeout(100)

      const scrollY = await page.evaluate(() => window.scrollY)
      releaseNextPageResponse?.()

      expect(scrollY).toBeGreaterThan(100)
      await page.getByText('Nothing more to load').waitFor({ state: 'visible' })
    }, 30000)

    it('loads tagged results and updates heading', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/posts/safebooru.org?tags=1girl'), { waitUntil: 'domcontentloaded' })
      await page.waitForURL('**/posts/safebooru.org?tags=1girl')

      // Assert
      const h2 = page.getByRole('heading', { level: 2, name: /^Posts$/ })
      await h2.waitFor({ state: 'visible' })

      const h1 = page.getByRole('heading', { level: 1 }).first()
      await h1.waitFor({ state: 'visible' })
      const normalizedH1Text = ((await h1.textContent()) ?? '').toLowerCase().replace(/\s+/g, '')
      expect(normalizedH1Text).toContain('1girl')

      expectImageSrcToReference(
        await getPostImageSrc(page, `safebooru.org-${mockPostsPage1.data[0].id}`),
        mockPostsPage1.data[0].low_res_file.url
      )
    }, 30000)

    it('uses post identity for virtual row keys', async () => {
      const page = await createTrackedPage()

      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      const firstVirtualKey = await page
        .getByTestId('posts-list')
        .locator('li')
        .first()
        .getAttribute('data-virtual-key')

      expect(firstVirtualKey).toBe(`safebooru.org-${mockPostsPage0.data[0].id}`)
    }, 30000)

    it('does not emit Vue patch errors while virtual rows scroll and route results change', async () => {
      const page = await createTrackedPage()
      const errorSignatures = [
        'emitsOptions',
        'nextSibling',
        "Cannot destructure property 'bum'",
        "null is not an object (evaluating 'i.emitsOptions')"
      ]
      const errors: string[] = []

      page.on('pageerror', (error) => {
        const message = error.message

        if (errorSignatures.some((signature) => message.includes(signature))) {
          errors.push(message)
        }
      })

      page.on('console', (message) => {
        if (message.type() !== 'error') {
          return
        }

        const text = message.text()

        if (errorSignatures.some((signature) => text.includes(signature))) {
          errors.push(text)
        }
      })

      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight)
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        window.scrollTo(0, 0)
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      })

      await page.goto(url('/posts/safebooru.org?tags=1girl'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId(`safebooru.org-${mockPostsPage1.data[0].id}`).first().waitFor({ state: 'visible' })

      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight)
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        window.scrollTo(0, 0)
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      })

      expect(errors).toEqual([])
    }, 30000)
  })

  describe('History', async () => {
    it('goes back & forward in history with correct scroll position', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

      const firstPost = page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`)
      await firstPost.waitFor({ state: 'visible' })

      expectImageSrcToReference(
        await getPostImageSrc(page, `safebooru.org-${mockPostsPage0.data[0].id}`),
        mockPostsPage0.data[0].low_res_file.url
      )

      // Navigate to a tag page
      await Promise.all([
        page.goto(url('/posts/safebooru.org?tags=1girl')),
        page.waitForURL('**/posts/safebooru.org?tags=1girl')
      ])

      expectImageSrcToReference(
        await getPostImageSrc(page, `safebooru.org-${mockPostsPage1.data[0].id}`),
        mockPostsPage1.data[0].low_res_file.url
      )

      // === Go back === //
      await Promise.all([page.goBack(), page.waitForURL('**/posts/safebooru.org')])

      expectImageSrcToReference(
        await getPostImageSrc(page, `safebooru.org-${mockPostsPage0.data[0].id}`),
        mockPostsPage0.data[0].low_res_file.url
      )

      // === Go forward === //
      await Promise.all([page.goForward(), page.waitForURL('**/posts/safebooru.org?tags=1girl')])

      expectImageSrcToReference(
        await getPostImageSrc(page, `safebooru.org-${mockPostsPage1.data[0].id}`),
        mockPostsPage1.data[0].low_res_file.url
      )
    }, 30000)

    it('replaces older history entries for the same tag query', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/posts/safebooru.org?tags=hair_bun&page=0'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      await page.evaluate(() => {
        window.localStorage.removeItem('settings-pageHistory')
      })

      // Trigger client-side pagination updates (replace=true in app logic)
      await page.evaluate(async () => {
        window.scrollTo(0, 0)
        await new Promise((resolve) => requestAnimationFrame(resolve))

        for (let i = 0; i < 20; i++) {
          window.scrollTo(0, document.documentElement.scrollHeight)
          window.dispatchEvent(new Event('scroll'))
          await new Promise((resolve) => requestAnimationFrame(resolve))
        }
      })
      await page.mouse.wheel(0, 100000)
      await page.waitForURL((u) => u.searchParams.get('tags') === 'hair_bun' && u.searchParams.get('page') !== '0', {
        timeout: 30000
      })

      const currentUrl = page.url()
      expect(currentUrl).toContain('tags=hair_bun')

      const currentPage = currentUrl.match(/[?&]page=(\d+)/)?.[1]
      expect(currentPage).toBeDefined()

      await page.waitForFunction(
        (pageValue) => {
          const history = JSON.parse(localStorage.getItem('settings-pageHistory') ?? '[]') as Array<{ path?: string }>

          const tagEntries = history.filter(
            (entry) => entry.path?.includes('/posts/safebooru.org') && entry.path.includes('tags=hair_bun')
          )

          return tagEntries.length === 1 && tagEntries[0].path?.includes(`page=${pageValue}`)
        },
        currentPage,
        { timeout: 10000 }
      )

      const history = await page.evaluate(() => JSON.parse(localStorage.getItem('settings-pageHistory') ?? '[]'))
      const tagEntries = history.filter(
        (entry: { path?: string }) =>
          entry.path?.includes('/posts/safebooru.org') && entry.path.includes('tags=hair_bun')
      )

      // Assert
      expect(tagEntries).toHaveLength(1)
      expect(tagEntries[0].path).toContain(`page=${currentPage}`)
    }, 60000)
  })

  describe('Domain', async () => {
    it('defaults domain to rule34.xxx', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId('domain-selector').waitFor({ state: 'visible' })

      // Expect selected booru to be rule34.xxx (compact selector shows favicon only)
      const selectedDomainFavicon = await page.getByTestId('domain-selector').locator('img').getAttribute('src')

      expect(selectedDomainFavicon).toContain('domain=rule34.xxx')
    }, 30000)

    it('changes domain', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/posts/rule34.xxx'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId('domain-selector').waitFor({ state: 'visible' })
      await page.waitForLoadState('networkidle')

      await page.getByTestId('domain-selector').click({ force: true })
      const safebooruOption = page.getByRole('option', { name: /safebooru\.org/i })
      await safebooruOption.waitFor({ state: 'visible' })

      const navigationPromise = page.waitForURL('**/posts/safebooru.org', { waitUntil: 'commit' })
      await safebooruOption.click({ force: true })
      await navigationPromise

      // Assert
      // Expect domain to be safebooru.org
      const domainSelectorText = await page.getByTestId('domain-selector').textContent()

      expect(domainSelectorText).toContain('safebooru.org')
    }, 30000)
  })

  describe('SEO', async () => {
    it('canonicalizes simple single-tag posts queries after client-side hydration', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act — navigate to a tagged posts page
      await page.goto(url('/posts/safebooru.org?tags=1girl'), { waitUntil: 'domcontentloaded' })
      await page.waitForURL('**/posts/safebooru.org?tags=1girl')

      // Assert — simple single-tag posts queries use the tag landing URL canonical.
      await page.waitForFunction(
        () =>
          document.querySelector('link[rel="canonical"]')?.getAttribute('href')?.includes('/posts/safebooru.org/1girl'),
        undefined,
        { timeout: 20000 }
      )
      const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonicalHref).toContain('/posts/safebooru.org/1girl')
    }, 30000)

    it('updates canonical link on client-side tag navigation', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act — start on one tag
      await page.goto(url('/posts/safebooru.org?tags=1girl'), { waitUntil: 'domcontentloaded' })
      await page.waitForURL('**/posts/safebooru.org?tags=1girl')

      // Navigate to a different tag (simulates user clicking a tag link)
      await Promise.all([
        page.goto(url('/posts/safebooru.org?tags=hair_bun')),
        page.waitForURL('**/posts/safebooru.org?tags=hair_bun')
      ])

      // Assert — canonical must reflect the new tag landing URL
      await page.waitForFunction(
        () =>
          document
            .querySelector('link[rel="canonical"]')
            ?.getAttribute('href')
            ?.includes('/posts/safebooru.org/hair_bun'),
        undefined,
        { timeout: 20000 }
      )
      const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonicalHref).toContain('/posts/safebooru.org/hair_bun')
      expect(canonicalHref).not.toContain('/posts/safebooru.org/1girl')
    }, 30000)

    it('description with sort filter', async () => {
      // Arrange
      const page = await createTrackedPage('/posts/safebooru.org?filter%5Bsort%5D=score')

      // Assert
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toContain('sorted by Score')
      expect(description).not.toContain(', ,')
      expect(description).toContain('from safebooru.org')
    }, 30000)

    it('description with sort + score filter (the original bug)', async () => {
      // Arrange
      const page = await createTrackedPage('/posts/safebooru.org?filter%5Bsort%5D=score&filter%5Bscore%5D=%3E%3D25')

      // Assert
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toContain('sorted by Score, with a score of >=25')
      expect(description).not.toContain(', ,')
      expect(description).toContain('from safebooru.org')
    }, 30000)

    it('description with all 3 filters (rating + sort + score)', async () => {
      // Arrange
      const page = await createTrackedPage(
        '/posts/safebooru.org?filter%5Brating%5D=explicit&filter%5Bsort%5D=score&filter%5Bscore%5D=%3E%3D25'
      )

      // Assert
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toContain('rated Explicit, sorted by Score, with a score of >=25')
      expect(description).not.toMatch(/,\s*,/)
      expect(description).toContain('from safebooru.org')
    }, 30000)
  })

  describe('Tag landing page', async () => {
    it('renders tag landing page with posts', async () => {
      const page = await createTrackedPage()
      await page.goto(url('/posts/safebooru.org/1girl'), { waitUntil: 'domcontentloaded' })

      const heading = page.getByRole('heading', { level: 1 })
      await heading.waitFor({ state: 'visible' })
      expect(await heading.textContent()).toContain('1 Girl')

      await page.locator('main section ol picture img').first().waitFor({ state: 'visible' })
    }, 30000)

    it('has clean canonical on tag landing page', async () => {
      const page = await createTrackedPage()
      await page.goto(url('/posts/safebooru.org/1girl'), { waitUntil: 'domcontentloaded' })

      const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonicalHref).toContain('/posts/safebooru.org/1girl')
      expect(canonicalHref).not.toContain('?tags=')
    }, 30000)

    it('keeps encoded percent tags stable', async () => {
      const page = await createTrackedPage()
      await page.goto(url('/posts/safebooru.org/100%25'), { waitUntil: 'domcontentloaded' })

      const heading = page.getByRole('heading', { level: 1 })
      await heading.waitFor({ state: 'visible' })

      const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonicalHref).toContain('/posts/safebooru.org/100%25')

      const browseAllHref = await page.getByRole('link', { name: /browse all/i }).getAttribute('href')
      expect(browseAllHref).toContain('tags=100%25')
    }, 30000)

    it('keeps locale prefix in tag landing canonical', async () => {
      const page = await createTrackedPage()
      await page.goto(url('/es/posts/safebooru.org/1girl'), { waitUntil: 'domcontentloaded' })

      const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(new URL(canonicalHref!).pathname).toBe('/es/posts/safebooru.org/1girl')
    }, 30000)
  })

  describe('Search', async () => {
    it.todo('autocompletes tags')
  })
})
