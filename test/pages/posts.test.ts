import { describe, expect, it } from 'vitest'
import { createPage, setup, url } from '@nuxt/test-utils'
import {
  mockPostsPage0,
  mockPostsPage1,
  mockPostsPageWithOfflineMedia,
  mockPostsPageWithoutResults
} from './posts.mock-data'
import { defaultSetupConfig } from '../helper'

describe('/', async () => {
  await setup(defaultSetupConfig)

  async function mockBooruApi(page: Awaited<ReturnType<typeof createPage>>) {
    await page.route('**/booru/**/tags*', (route) =>
      route.fulfill({
        status: 200,
        json: []
      })
    )

    await page.route('**/booru/**/posts*', async (route) => {
      const requestUrl = new URL(route.request().url())
      const pageID = requestUrl.searchParams.get('pageID')
      const tags = requestUrl.searchParams.get('tags')
      const baseEndpoint = requestUrl.searchParams.get('baseEndpoint')

      if (baseEndpoint === 'example.local') {
        return route.fulfill({
          status: 200,
          json: mockPostsPageWithOfflineMedia
        })
      }

      if (baseEndpoint === 'empty.local') {
        return route.fulfill({
          status: 200,
          json: mockPostsPageWithoutResults
        })
      }

      if (tags === 'hair_bun') {
        return route.fulfill({
          status: 200,
          json: {
            ...mockPostsPage0,
            links: {
              ...mockPostsPage0.links,
              self: `http://localhost:8081/booru/gelbooru/posts?baseEndpoint=safebooru.org&pageID=${pageID ?? '0'}&limit=30&tags=hair_bun`
            }
          }
        })
      }

      if (tags === '1girl') {
        return route.fulfill({
          status: 200,
          json: mockPostsPage1
        })
      }

      if (pageID === '1') {
        return route.fulfill({
          status: 200,
          json: mockPostsPage1
        })
      }

      return route.fulfill({
        status: 200,
        json: mockPostsPage0
      })
    })
  }

  it('sets mockdata correctly', async () => {
    // Make sure mockPostsPage0 and mockPostsPage1 have different first posts
    expect(mockPostsPage0.data[0].id).not.toBe(mockPostsPage1.data[0].id)
  })

  describe('Basic', async () => {
    it('renders page', async () => {
      // Arrange
      const page = await createPage('/posts/safebooru.org')

      // Act
      const headerElement = page.getByRole('heading', { name: 'Posts', exact: true })

      // Assert
      await headerElement.isVisible()
    })

    it('renders a loader', async () => {
      // Arrange
      const page = await createPage()

      await page.route(
        '**/booru/**/posts*',
        async (route) => {
          await new Promise((resolve) => setTimeout(resolve, 5000))

          await route.fulfill({
            status: 200,
            json: mockPostsPage0
          })
        },
        { times: 1 }
      )

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })
      const loaderElement = page.getByTestId('posts-loader')

      // Assert
      await loaderElement.isVisible()
    })

    it('shows no results', async () => {
      // Arrange
      const page = await createPage()

      await page.route(
        '**/booru/**/posts*',
        (route) =>
          route.fulfill({
            status: 200,
            json: mockPostsPageWithoutResults
          }),
        { times: 1 }
      )

      // Act
      await Promise.all([
        page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' }),
        page.waitForResponse('**/booru/**/posts*')
      ])

      const titleElement = page.getByRole('heading', { name: /no results/i })

      // Assert
      await titleElement.isVisible()
    })
  })

  describe('Posts', async () => {
    it('renders posts', async () => {
      // Arrange
      const page = await createPage()
      await mockBooruApi(page)

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

      const firstPost = page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`)

      // Assert DOM
      await firstPost.waitFor({ state: 'visible' })

      // Image
      const firstPostImage = firstPost.locator('img')

      expect(await firstPostImage.getAttribute('src')).toBe(mockPostsPage0.data[0].low_res_file.url)

      await firstPost.getByRole('button', { name: /tags/i }).click()

      // BottomSheet renders outside post row subtree; assert one known tag appears
      expect(await page.getByRole('button', { name: /1girl/i }).first().isVisible()).toBe(true)
    })

    // TODO: Test that verifies if a post with 'unknown' media type is not rendered

    it.todo('proxies media when media failed to load', async () => {})

    it('renders warning when media failed to load', async () => {
      // Arrange
      const page = await createPage()

      await page.route('**/booru/**/tags*', (route) =>
        route.fulfill({
          status: 200,
          json: []
        })
      )

      await page.route('**/booru/**/posts*', (route) =>
        route.fulfill({
          status: 200,
          json: mockPostsPageWithOfflineMedia
        })
      )

      await page.route('**/example.local/**', (route) =>
        route.fulfill({
          status: 404
        })
      )

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

      // Assert
      const postWithWarning = page.getByTestId(`safebooru.org-${mockPostsPageWithOfflineMedia.data[0].id}`).first()
      await postWithWarning.waitFor({ state: 'visible' })
      expect(await postWithWarning.textContent()).toContain('Error loading media')
    })
  })

  describe('Pagination', async () => {
    it('loads more posts', async () => {
      // Arrange
      const page = await createPage()
      await mockBooruApi(page)

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

      // First page is visible
      await page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      // Trigger load-more deterministically with one native scroll to bottom.
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
      await page.waitForURL('**/posts/safebooru.org?page=1')

      // Assert DOM
      await page.getByTestId(`safebooru.org-${mockPostsPage1.data[0].id}`).first().waitFor({ state: 'visible' })
    }, 15000)

    it('loads tagged results and updates heading', async () => {
      // Arrange
      const page = await createPage()
      await mockBooruApi(page)

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

      const firstTaggedPostImage = page.getByTestId(`safebooru.org-${mockPostsPage1.data[0].id}`).first().locator('img')
      expect(await firstTaggedPostImage.getAttribute('src')).toBe(mockPostsPage1.data[0].low_res_file.url)
    })
  })

  describe('History', async () => {
    it('goes back & forward in history with correct scroll position', async () => {
      // Arrange
      const page = await createPage()
      await mockBooruApi(page)

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

      const firstPost = page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`)
      await firstPost.waitFor({ state: 'visible' })

      const firstPostImage = firstPost.first().locator('img')
      expect(await firstPostImage.getAttribute('src')).toBe(mockPostsPage0.data[0].low_res_file.url)

      // Navigate to a tag page
      await Promise.all([
        page.goto(url('/posts/safebooru.org?tags=1girl')),
        page.waitForURL('**/posts/safebooru.org?tags=1girl')
      ])

      const firstTaggedPostImage = page.getByTestId(`safebooru.org-${mockPostsPage1.data[0].id}`).first().locator('img')
      expect(await firstTaggedPostImage.getAttribute('src')).toBe(mockPostsPage1.data[0].low_res_file.url)

      // === Go back === //
      await Promise.all([page.goBack(), page.waitForURL('**/posts/safebooru.org')])

      const firstPostAfterBackImage = page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().locator('img')
      expect(await firstPostAfterBackImage.getAttribute('src')).toBe(mockPostsPage0.data[0].low_res_file.url)

      // === Go forward === //
      await Promise.all([page.goForward(), page.waitForURL('**/posts/safebooru.org?tags=1girl')])

      const firstPostAfterForwardImage = page
        .getByTestId(`safebooru.org-${mockPostsPage1.data[0].id}`)
        .first()
        .locator('img')
      expect(await firstPostAfterForwardImage.getAttribute('src')).toBe(mockPostsPage1.data[0].low_res_file.url)
    }, 15000)

    it('replaces older history entries for the same tag query', async () => {
      // Arrange
      const page = await createPage()
      await mockBooruApi(page)

      // Act
      await page.goto(url('/posts/safebooru.org?tags=hair_bun&page=0'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      await page.evaluate(() => {
        window.localStorage.removeItem('settings-pageHistory')
      })

      // Trigger client-side pagination updates (replace=true in app logic)
      for (let i = 0; i < 20; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        if (page.url().includes('tags=hair_bun') && !page.url().includes('page=0')) break
        await page.waitForTimeout(150)
      }

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
    }, 20000)
  })

  describe('Domain', async () => {
    it('defaults domain to rule34.xxx', async () => {
      // Arrange
      const page = await createPage()
      await mockBooruApi(page)

      // Act
      await page.goto(url('/'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId('domain-selector').waitFor({ state: 'visible' })

      // Expect selected booru to be rule34.xxx (compact selector shows favicon only)
      const selectedDomainFavicon = await page.getByTestId('domain-selector').locator('img').getAttribute('src')

      expect(selectedDomainFavicon).toContain('rule34.xxx.ico')
    })

    it('changes domain', async () => {
      // Arrange
      const page = await createPage()
      await mockBooruApi(page)

      // Act
      await page.goto(url('/posts/rule34.xxx'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId('domain-selector').waitFor({ state: 'visible' })

      await page.getByTestId('domain-selector').click()
      await page.getByRole('option', { name: /safebooru/i }).waitFor({ state: 'visible' })

      await Promise.all([
        page.getByRole('option', { name: /safebooru/i }).click(),

        page.waitForURL('**/posts/safebooru.org')
      ])

      // Assert
      // Expect domain to be safebooru.org
      const domainSelectorText = await page.getByTestId('domain-selector').textContent()

      expect(domainSelectorText).toContain('safebooru.org')
    })
  })

  describe('SEO', async () => {
    it('preserves tags in canonical link after client-side hydration', async () => {
      // Arrange
      const page = await createPage()
      await mockBooruApi(page)

      // Act — navigate to a tagged posts page
      await page.goto(url('/posts/safebooru.org?tags=1girl'), { waitUntil: 'domcontentloaded' })
      await page.waitForURL('**/posts/safebooru.org?tags=1girl')

      // Assert — canonical in the DOM must include ?tags= (not stripped by i18n)
      const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonicalHref).toContain('tags=1girl')
    })

    it('updates canonical link on client-side tag navigation', async () => {
      // Arrange
      const page = await createPage()
      await mockBooruApi(page)

      // Act — start on one tag
      await page.goto(url('/posts/safebooru.org?tags=1girl'), { waitUntil: 'domcontentloaded' })
      await page.waitForURL('**/posts/safebooru.org?tags=1girl')

      // Navigate to a different tag (simulates user clicking a tag link)
      await Promise.all([
        page.goto(url('/posts/safebooru.org?tags=hair_bun')),
        page.waitForURL('**/posts/safebooru.org?tags=hair_bun')
      ])

      // Assert — canonical must reflect the new tag
      const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonicalHref).toContain('tags=hair_bun')
      expect(canonicalHref).not.toContain('tags=1girl')
    })
  })

  describe('Search', async () => {
    it.todo('autocompletes tags')

    it.todo('loads a tag page')
  })
})
