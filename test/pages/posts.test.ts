import { describe, expect, it } from 'vitest'
import { setup, url } from '@nuxt/test-utils'
import {
  mockPostsPage0,
  mockPostsPage1,
  mockPostsPageWithOfflineMedia,
  mockPostsPageWithVideoMedia,
  mockPostsPageWithMultipleVideos
} from './posts.mock-data'
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

const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64'
)

/** Minimal valid 8-bit mono WAV, enough for a media element to report loadedmetadata. */
function createSilentWav(samples = 800) {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + samples, 4)
  header.write('WAVEfmt ', 8)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(8000, 24)
  header.writeUInt32LE(8000, 28)
  header.writeUInt16LE(1, 32)
  header.writeUInt16LE(8, 34)
  header.write('data', 36)
  header.writeUInt32LE(samples, 40)

  return Buffer.concat([header, Buffer.alloc(samples, 128)])
}

/** Signs a fake premium user in: the SDK only decodes the JWT expiry, and auth-refresh is answered locally. */
async function signInAsPremiumUser(page: TrackedPage) {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 86400 })}.sig`
  const record = {
    id: 'premium-test-user',
    collectionName: 'users',
    email: 'premium@example.test',
    subscription_expires_at: new Date(Date.now() + 86400_000).toISOString()
  }

  await page.route(/pocketbase\.r34\.app/, (route) => {
    if (route.request().url().includes('auth-refresh')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token, record }) })
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], totalItems: 0 })
    })
  })

  await page.context().addCookies([
    {
      name: 'pb_auth',
      value: encodeURIComponent(JSON.stringify({ token, model: record })),
      url: url('/')
    }
  ])
}

/**
 * Resolves with how long (ms) the Fluid Player wrapper takes to appear in the post after the video is
 * brought into view (scroll) or poked (pointerenter). Timed in-page to avoid test-runner latency.
 */
async function timeFluidUpgrade(page: TrackedPage, testId: string, trigger: 'scroll' | 'pointerenter') {
  return page.evaluate(
    ({ id, how }) =>
      new Promise<number>((resolve, reject) => {
        const post = document.querySelector(`[data-testid="${id}"]`)
        const video = post?.querySelector('video')

        if (!post || !video) {
          reject(new Error('post or video not found'))
          return
        }

        const startedAt = performance.now()
        const observer = new MutationObserver(() => {
          if (post.querySelector('.fluid_video_wrapper')) {
            observer.disconnect()
            resolve(performance.now() - startedAt)
          }
        })

        observer.observe(post, { childList: true, subtree: true })
        setTimeout(() => {
          observer.disconnect()
          reject(new Error('Fluid Player did not mount within 3s'))
        }, 3000)

        if (how === 'scroll') {
          video.scrollIntoView({ block: 'center' })
        } else {
          video.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
        }
      }),
    { id: testId, how: trigger }
  )
}

/** Video mocks point at unreachable hosts; a reachable poster keeps them looking healthy until played. */
async function mockReachableVideoPosters(page: TrackedPage) {
  await page.route(/example\.local\/thumbnails\//, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL_PNG })
  )
}

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

/** Collects real app problems from the console; failed loads of the mocked external hosts are not app issues. */
function collectConsoleProblems(page: TrackedPage) {
  const problems: string[] = []

  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    const text = message.text()
    // The mocked PocketBase answers its realtime stream with JSON, which the browser rejects as an event stream (the
    // cloud sync then logs that it could not subscribe)
    const isNetworkNoise =
      text.startsWith('Failed to load resource') || text.includes('EventSource') || text.includes('premium cloud sync')
    const isVueProblem = /Vue warn|Hydration/.test(text)

    if ((message.type() === 'error' && !isNetworkNoise) || isVueProblem) {
      problems.push(`${message.type()}: ${text.slice(0, 200)}`)
    }
  })

  return problems
}

/** Client-side navigation that keeps the document (and its referrer policy) alive. */
function pushRoute(page: TrackedPage, path: string) {
  return page.evaluate(
    (target) =>
      (
        document.querySelector('#__nuxt') as unknown as {
          __vue_app__: { config: { globalProperties: { $router: { push: (to: string) => Promise<unknown> } } } }
        }
      ).__vue_app__.config.globalProperties.$router.push(target),
    path
  )
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
      expect(await headerElement.isVisible()).toBe(true)
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

    it('renders the tag title in the page header without nesting a heading inside a paragraph', async () => {
      // Arrange: a p is closed by the HTML parser before an h1, which breaks hydration (Vue's warnings are stripped
      // from the production build these tests run against, so check the server HTML itself)
      const page = await createTrackedPage()

      // Act
      const response = await page.request.get(url('/posts/safebooru.org?tags=video_test'))
      const html = await response.text()

      // Assert (booleans, so a failure does not dump the whole document)
      expect(html.includes('<h1 class="text-sm">')).toBe(true)
      expect(/<p(?:\s[^>]*)?>(?:(?!<\/p>)[\s\S])*?<h1/.test(html)).toBe(false)
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
      expect(await titleElement.isVisible()).toBe(true)
    }, 30000)

    it('renders upstream rate-limit 502 error with retry button and without bot verification', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/posts/safebooru.org?tags=rate_limited_502_test'), { waitUntil: 'domcontentloaded' })

      // Assert
      await page.getByRole('heading', { name: 'Failed to load posts' }).waitFor({ state: 'visible', timeout: 10000 })
      await page.getByText('Upstream booru rate limited').waitFor({ state: 'visible', timeout: 10000 })
      await page.getByRole('button', { name: 'Retry' }).waitFor({ state: 'visible', timeout: 10000 })
      expect(await page.getByText('Verify I am not a Bot').count()).toBe(0)
    }, 30000)

    it('renders client 429 error with bot verification challenge', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/posts/safebooru.org?tags=client_429_test'), { waitUntil: 'domcontentloaded' })

      // Assert
      await page.getByRole('heading', { name: 'Too many requests' }).waitFor({ state: 'visible', timeout: 10000 })
      await page.getByText('Verify I am not a Bot').waitFor({ state: 'visible', timeout: 10000 })
      await page.getByRole('button', { name: 'Retry' }).waitFor({ state: 'visible', timeout: 10000 })
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

    it('falls back to resilient proxy/CDN candidate when direct origin media fails', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Block both initial imgproxy and direct origin requests to simulate direct load failure
      await page.route(/https:\/\/(imgproxy2\.r34\.app|safebooru\.org\/samples)\//, async (route) => {
        await route.abort('failed')
      })

      // Fulfill fallback CDN requests with a valid image
      await page.route(/https:\/\/(i[0-3]\.wp\.com|external-content\.duckduckgo\.com)\//, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'image/png',
          body: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
            'base64'
          )
        })
      })

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

      // Assert
      const firstPost = page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first()
      await firstPost.waitFor({ state: 'visible' })

      // The image should failover to a fallback candidate (wp.com / photon)
      await page.waitForFunction(
        (id) => {
          const post = document.querySelector(`[data-testid="${id}"]`)
          const img = post?.querySelector('img')
          const src = img?.getAttribute('src')
          return (
            src != null &&
            src.includes('wp.com') &&
            img instanceof HTMLImageElement &&
            img.complete &&
            img.naturalWidth > 0
          )
        },
        `safebooru.org-${mockPostsPage0.data[0].id}`,
        { timeout: 10000 }
      )

      const fallbackSrc = await firstPost.locator('img').first().getAttribute('src')
      expect(fallbackSrc).toContain('wp.com')
      expect(await firstPost.textContent()).not.toContain('Error loading media')
    }, 30000)

    it('applies expected referrer policy attribute on rendered media', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })

      // Assert
      const firstPost = page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first()
      await firstPost.waitFor({ state: 'visible' })

      const img = firstPost.locator('img').first()
      await img.waitFor({ state: 'attached' })

      // Third-party boorus (safebooru, etc.) must use 'no-referrer' to prevent hotlinking 403 blocks
      await page.waitForFunction(
        (id) => {
          const post = document.querySelector(`[data-testid="${id}"]`)
          return post?.querySelector('img')?.getAttribute('referrerpolicy') === 'no-referrer'
        },
        `safebooru.org-${mockPostsPage0.data[0].id}`,
        { timeout: 10000 }
      )
      const referrerpolicy = await img.getAttribute('referrerpolicy')
      expect(referrerpolicy).toBe('no-referrer')
    }, 20000)

    it('renders promoted content with a valid media asset and no media error', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })
      const firstPost = page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first()
      await firstPost.waitFor({ state: 'visible' })

      // Scroll down until LazyPromotedContent (figure.-mx-1) is mounted in the virtualized list
      const figureFound = await page.evaluate(async () => {
        for (let i = 0; i < 20; i++) {
          window.scrollBy(0, 1200)
          window.dispatchEvent(new Event('scroll'))
          await new Promise((resolve) => setTimeout(resolve, 50))
          if (document.querySelector('figure.-mx-1')) {
            return true
          }
        }
        return false
      })

      expect(figureFound).toBe(true)

      // The promoted content figure should be mounted and visible
      const promoFigure = page.locator('figure.-mx-1').first()
      await promoFigure.waitFor({ state: 'attached', timeout: 15000 })
      await promoFigure.scrollIntoViewIfNeeded()
      await promoFigure.waitFor({ state: 'visible', timeout: 10000 })

      // Media inside promoted content must have a valid non-empty src
      const promoMedia = promoFigure.locator('img, iframe, video').first()
      await promoMedia.waitFor({ state: 'attached', timeout: 20000 })

      const promoSrc = await promoMedia.evaluate((el) => {
        if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement || el instanceof HTMLIFrameElement) {
          return el.src || el.getAttribute('src')
        }
        return null
      })

      expect(promoSrc).toBeTruthy()
      expect(promoSrc).not.toBe('')
      expect(promoSrc).not.toContain('/null')

      // Promoted content must not trigger a media load error
      expect(await promoFigure.textContent()).not.toContain('Error loading media')
    }, 60000)

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
      // A failed image with no successful fallback is most likely a dead link, not a host block
      expect(await postWithWarning.textContent()).not.toContain('This host blocks direct access')
    }, 20000)

    it('does not trip the host breaker or blame the host when direct and proxy loads both fail', async () => {
      // Arrange: every image candidate fails, as for a deleted file
      const page = await createTrackedPage()

      const requested: string[] = []
      await page.route(
        /https:\/\/(imgproxy2\.r34\.app|safebooru\.org\/samples|i[0-3]\.wp\.com|external-content\.duckduckgo\.com)\//,
        async (route) => {
          requested.push(route.request().url())
          await route.abort('failed')
        }
      )

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })
      await page.waitForFunction(() => document.body.textContent?.includes('Error loading media'), undefined, {
        timeout: 15000
      })
      // Scroll in stages so later posts render after earlier ones have already failed (breaker threshold is 3)
      const failedPostCount = () =>
        page.evaluate(
          () =>
            Array.from(document.querySelectorAll('[data-testid^="safebooru.org-"]')).filter((post) =>
              post.textContent?.includes('Error loading media')
            ).length
        )

      for (let step = 0; step < 12; step += 1) {
        await page.waitForTimeout(500)
        await page.evaluate(() => window.scrollBy(0, 900))
      }

      await page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll('[data-testid^="safebooru.org-"]')).filter((post) =>
            post.textContent?.includes('Error loading media')
          ).length >= 5,
        undefined,
        { timeout: 20000 }
      )
      expect(await failedPostCount()).toBeGreaterThanOrEqual(5)

      // Assert: the host is never blamed for a file that no proxy could load
      expect(await page.locator('body').textContent()).not.toContain('This host blocks direct access')

      // Assert: the breaker never tripped, so every failed post tried its own direct URL before any proxy
      const failedPostIds = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[data-testid^="safebooru.org-"]'))
          .filter((post) => post.textContent?.includes('Error loading media'))
          .map((post) => post.getAttribute('data-testid')?.replace('safebooru.org-', ''))
      )
      // The first 8 server-rendered posts load through imgproxy and fall back straight to the proxies, so only later
      // posts prove the breaker stayed closed: a tripped breaker would send them to a proxy before any direct request.
      const failedFiles = mockPostsPage0.data
        .filter((post, index) => index >= 8 && failedPostIds.includes(String(post.id)))
        .map((post) => post.low_res_file.url.split('/').pop())

      expect(failedFiles.length).toBeGreaterThanOrEqual(2)

      for (const file of failedFiles) {
        const firstAttempt = requested.find(
          (requestUrl) => requestUrl.includes(`/samples/`) && requestUrl.includes(file!)
        )
        expect(firstAttempt, `no request recorded for ${file}`).toBeDefined()
        expect(new URL(firstAttempt!).hostname, `first request for ${file} skipped the direct source`).toBe(
          'safebooru.org'
        )
      }
    }, 45000)

    it('offers the same recovery actions for images and videos when media cannot load', async () => {
      // Arrange: nothing reachable, so every candidate fails
      const page = await createTrackedPage()
      await page.route(
        /(imgproxy2\.r34\.app|example\.local|safebooru\.org\/samples|\.wp\.com|duckduckgo\.com)/,
        (route) => route.abort('failed')
      )

      // Act
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'domcontentloaded' })

      // Assert: the video shows the card without being played, with the shared actions
      const videoPost = page.getByTestId(`safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`).first()
      await videoPost.getByText('Error loading media').waitFor({ state: 'visible', timeout: 15000 })

      for (const post of [videoPost]) {
        expect(await post.getByRole('link', { name: /Get Premium/ }).count()).toBe(1)
        expect(await post.getByRole('button', { name: 'View in sandbox' }).count()).toBe(1)
        expect(await post.getByRole('link', { name: 'Open new tab' }).count()).toBe(1)
        expect(await post.getByRole('button', { name: 'Try again?' }).count()).toBe(1)
      }
    }, 30000)

    it('shows the image error card with the sandbox action and keeps Try again available after retries', async () => {
      // Arrange
      const page = await createTrackedPage()
      await page.route(/(imgproxy2\.r34\.app|safebooru\.org\/samples|\.wp\.com|duckduckgo\.com)/, (route) =>
        route.abort('failed')
      )

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })
      const firstPost = page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first()
      await firstPost.getByText('Error loading media').waitFor({ state: 'visible', timeout: 15000 })

      // Assert: images get the same actions as videos
      expect(await firstPost.getByRole('button', { name: 'View in sandbox' }).count()).toBe(1)
      expect(await firstPost.getByRole('link', { name: 'Open new tab' }).count()).toBe(1)

      // Assert: View in sandbox opens the sandboxed frame
      await firstPost.getByRole('button', { name: 'View in sandbox' }).click()
      await firstPost.locator('iframe[sandbox]').waitFor({ state: 'attached' })

      // Assert: closing returns to the card, and Try again stays available after a failed retry
      await firstPost.getByRole('button', { name: 'Close' }).click()
      await firstPost.getByRole('button', { name: 'Try again?' }).click()
      await firstPost.getByText('Error loading media').waitFor({ state: 'visible', timeout: 15000 })
      expect(await firstPost.getByRole('button', { name: 'Try again?' }).count()).toBe(1)
      expect(await firstPost.getByRole('button', { name: 'Try again?' }).isEnabled()).toBe(true)
    }, 45000)

    it('does not hide a playable video behind an error card when only its poster fails', async () => {
      // Arrange: poster blocked, but the video itself loads (a tiny valid WAV is enough for metadata)
      const page = await createTrackedPage()
      await page.route(/example\.local\/thumbnails\//, (route) => route.abort('failed'))
      await page.route(/example\.local\/videos\//, (route) =>
        route.fulfill({ status: 200, contentType: 'audio/wav', body: createSilentWav() })
      )

      // Act
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })

      // Assert
      const videoPost = page.getByTestId(`safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`).first()
      await videoPost.waitFor({ state: 'visible' })
      await page.waitForTimeout(1500)
      expect(await videoPost.locator('video').count()).toBeGreaterThan(0)
    }, 30000)

    it('upgrades the native video to Fluid Player without initialization errors', async () => {
      // Arrange
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)

      const pageErrors: string[] = []
      page.on('pageerror', (pageError) => pageErrors.push(pageError.message))
      page.on('console', (message) => {
        if (message.type() === 'error') pageErrors.push(message.text())
      })

      // Act
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })
      const videoPost = page.getByTestId(`safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`).first()
      // No hover or click: the player must mount on its own once the video is in view
      await videoPost.locator('video').first().scrollIntoViewIfNeeded()

      // Assert: the custom player wraps the video, and nothing was swallowed on the way
      await videoPost.locator('.fluid_video_wrapper').waitFor({ state: 'attached', timeout: 15000 })
      expect(pageErrors.filter((message) => /Fluid Player|toLowerCase/.test(message))).toEqual([])
    }, 30000)

    it('rounds the top of the Fluid Player like the card, lets its context menu leave the box and adds no height', async () => {
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })
      const videoPost = page.getByTestId(`safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`).first()
      await videoPost.locator('video').first().scrollIntoViewIfNeeded()
      await videoPost.locator('.fluid_video_wrapper').waitFor({ state: 'attached', timeout: 15000 })

      const style = await videoPost.locator('.fluid_video_wrapper').evaluate((wrapper) => {
        const computed = getComputedStyle(wrapper)
        const video = getComputedStyle(wrapper.querySelector('video')!)

        return {
          wrapperTop: [computed.borderTopLeftRadius, computed.borderTopRightRadius],
          wrapperBottom: [computed.borderBottomLeftRadius, computed.borderBottomRightRadius],
          videoTop: [video.borderTopLeftRadius, video.borderTopRightRadius],
          overflow: computed.overflow,
          // The wrapper must fill its container, otherwise the post grows when Fluid mounts
          gap: wrapper.parentElement!.getBoundingClientRect().height - wrapper.getBoundingClientRect().height
        }
      })

      expect(style).toEqual({
        wrapperTop: ['6px', '6px'],
        wrapperBottom: ['0px', '0px'],
        videoTop: ['6px', '6px'],
        overflow: 'visible',
        gap: 0
      })
    }, 30000)

    it('falls back to the premium proxy for a video whose direct source and poster are blocked', async () => {
      // Arrange: a premium user, direct poster and video blocked, only the proxy answers
      const page = await createTrackedPage()
      await signInAsPremiumUser(page)
      await page.route(/example\.local/, (route) => route.abort('failed'))
      await page.route(/api\/cors-proxy/, (route) =>
        route.fulfill({ status: 200, contentType: 'audio/wav', body: createSilentWav() })
      )

      // Act
      const proxiedVideoResponse = page.waitForResponse(
        (response) => response.url().includes('cors-proxy') && decodeURIComponent(response.url()).includes('/videos/')
      )
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })
      const videoPost = page.getByTestId(`safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`).first()
      await videoPost.waitFor({ state: 'visible' })

      // Assert: the video moves to the proxy candidate instead of showing the error card
      await page.waitForFunction(
        (id) => document.querySelector(`[data-testid="${id}"] video`)?.getAttribute('src')?.includes('cors-proxy'),
        `safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`,
        { timeout: 15000 }
      )
      // The src changes before the metadata probe settles, so wait for the proxied file to be served and for the
      // probe to have had the chance to fail before asserting that the card stays away
      await proxiedVideoResponse
      await page.waitForTimeout(1000)
      expect(await videoPost.textContent()).not.toContain('Error loading media')
    }, 45000)

    it('upgrades the replacement video to Fluid Player when the metadata probe advances to the next candidate', async () => {
      // Arrange: poster dead, direct video stalls long enough for the idle upgrade, then fails; only the proxy answers
      const page = await createTrackedPage()
      await signInAsPremiumUser(page)
      await page.route(/example\.local\/thumbnails\//, (route) => route.abort('failed'))
      await page.route(/example\.local\/.*videos\//, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 3500))
        await route.abort('failed').catch(() => {})
      })
      await page.route(/api\/cors-proxy/, (route) =>
        route.fulfill({ status: 200, contentType: 'audio/wav', body: createSilentWav() })
      )
      const testId = `safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`
      const videoPost = page.getByTestId(testId).first()

      // Act
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })

      // Assert: the player is re-created around the proxied video instead of leaving a native one behind
      await page.waitForFunction(
        (id) =>
          document
            .querySelector(`[data-testid="${id}"] .fluid_video_wrapper video`)
            ?.getAttribute('src')
            ?.includes('cors-proxy'),
        testId,
        { timeout: 15000 }
      )
      // The superseded wrapper goes away with its keyed <video>, leaving exactly one player
      await expect.poll(() => videoPost.locator('.fluid_video_wrapper').count(), { timeout: 5000 }).toBe(1)
    }, 60000)

    it('keeps deferring the first Fluid Player upgrade on a cold page load', async () => {
      // Arrange: record when the custom player first appears, relative to navigation start
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)
      await page.addInitScript(() => {
        const observer = new MutationObserver(() => {
          if (document.querySelector('.fluid_video_wrapper')) {
            ;(window as unknown as { __fluidFirstAt: number }).__fluidFirstAt = performance.now()
            observer.disconnect()
          }
        })

        observer.observe(document, { childList: true, subtree: true })
      })

      // Act
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'domcontentloaded' })
      await page.waitForFunction(() => '__fluidFirstAt' in window, undefined, { timeout: 15000 })

      // Assert: the idle prefetch can finish Fluid early on a fast machine (~400ms), so only an upgrade during
      // hydration itself counts as eager; the old fixed deferral was 1.6s
      const firstAt = await page.evaluate(() => (window as unknown as { __fluidFirstAt: number }).__fluidFirstAt)
      expect(firstAt).toBeGreaterThan(250)
    }, 45000)

    it('upgrades videos scrolled into view immediately once Fluid Player is loaded', async () => {
      // Arrange: short viewport so the second video starts below the fold
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)
      await page.setViewportSize({ width: 1280, height: 400 })

      const firstId = `safebooru.org-${mockPostsPageWithMultipleVideos.data[0].id}`
      const secondId = `safebooru.org-${mockPostsPageWithMultipleVideos.data[1].id}`

      await page.goto(url('/posts/safebooru.org?tags=multi_video_test'), { waitUntil: 'networkidle' })

      // The first upgrade loads the module, so every later video should skip the cold-load deferral
      await page
        .locator(`[data-testid="${firstId}"] .fluid_video_wrapper`)
        .waitFor({ state: 'attached', timeout: 15000 })

      const secondIsBelowFold = await page.evaluate((id) => {
        const video = document.querySelector(`[data-testid="${id}"] video`)
        const wrapper = document.querySelector(`[data-testid="${id}"] .fluid_video_wrapper`)

        return !!video && !wrapper && video.getBoundingClientRect().top > innerHeight + 100
      }, secondId)
      expect(secondIsBelowFold).toBe(true)

      // Act
      const elapsed = await timeFluidUpgrade(page, secondId, 'scroll')

      // Assert: previously ~1600ms (1.6s deferral + idle wait)
      expect(elapsed).toBeLessThan(500)
    }, 60000)

    it('prefetches Fluid Player when idle, without any video asking for it', async () => {
      // Arrange: no video can ever report being in view, so only the idle prefetch can load the module
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)
      await page.addInitScript(() => {
        window.IntersectionObserver = class {
          observe() {}
          unobserve() {}
          disconnect() {}
          takeRecords() {
            return []
          }
        } as unknown as typeof IntersectionObserver
      })

      const fluidCssRequested = page.waitForRequest((request) => /fluidplayer.*\.css/.test(request.url()), {
        timeout: 20000
      })

      // Act
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'domcontentloaded' })

      // Assert: the module is fetched anyway, and no player was mounted by a video-driven upgrade
      await fluidCssRequested
      expect(await page.locator('.fluid_video_wrapper').count()).toBe(0)
    }, 45000)

    it('does not display media load error when video completes or ends normally', async () => {
      // Arrange
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)

      // Act
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })

      // Assert
      const videoPost = page.getByTestId(`safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`).first()
      await videoPost.waitFor({ state: 'visible' })

      const videoElement = videoPost.locator('video').first()
      await videoElement.waitFor({ state: 'attached' })

      // Simulate video playback completion (ended=true) and subsequent player events
      await page.evaluate((testId) => {
        const video = document.querySelector<HTMLVideoElement>(`[data-testid="${testId}"] video`)
        if (!video) throw new Error('video element not found')
        Object.defineProperty(video, 'duration', { value: 15, configurable: true })
        Object.defineProperty(video, 'currentTime', { value: 15, configurable: true })
        Object.defineProperty(video, 'ended', { value: true, configurable: true })
        video.dispatchEvent(new Event('ended'))
        video.dispatchEvent(new Event('error'))
      }, `safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`)

      // Video ending must not trigger an error state
      expect(await videoPost.textContent()).not.toContain('Error loading media')
      expect(await videoElement.count()).toBeGreaterThan(0)
    }, 20000)

    it('triggers media load error on genuine mid-playback video failure when ended is false', async () => {
      // Arrange
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)

      // Act
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })

      // Assert
      const videoPost = page.getByTestId(`safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`).first()
      await videoPost.waitFor({ state: 'visible' })

      const videoElement = videoPost.locator('video').first()
      await videoElement.waitFor({ state: 'attached' })

      // Simulate genuine playback failure (ended=false)
      await page.evaluate((testId) => {
        const video = document.querySelector<HTMLVideoElement>(`[data-testid="${testId}"] video`)
        if (!video) throw new Error('video element not found')
        Object.defineProperty(video, 'duration', { value: 15, configurable: true })
        Object.defineProperty(video, 'currentTime', { value: 14.8, configurable: true })
        Object.defineProperty(video, 'ended', { value: false, configurable: true })
        video.dispatchEvent(new Event('error'))
      }, `safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`)

      await page.waitForFunction(() => document.body.textContent?.includes('Error loading media'))
      expect(await videoPost.textContent()).toContain('Error loading media')
    }, 20000)

    it('ignores bogus /null source resets on video loop/end and preserves playback', async () => {
      // Arrange
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)

      // Act
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })

      // Assert
      const videoPost = page.getByTestId(`safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`).first()
      await videoPost.waitFor({ state: 'visible' })

      const videoElement = videoPost.locator('video').first()
      await videoElement.waitFor({ state: 'attached' })
      const sourceBeforeReset = await videoElement.evaluate((video) => (video as HTMLVideoElement).src)

      // Simulate video player resetting source to /null on loop
      await page.evaluate((testId) => {
        const video = document.querySelector<HTMLVideoElement>(`[data-testid="${testId}"] video`)
        if (!video) throw new Error('video element not found')
        video.src = 'https://example.local/null'
        video.dispatchEvent(new Event('error'))
      }, `safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`)

      expect(await videoElement.evaluate((video) => (video as HTMLVideoElement).src)).toBe(sourceBeforeReset)
      // Must not display error
      expect(await videoPost.textContent()).not.toContain('Error loading media')
      expect(await videoElement.count()).toBeGreaterThan(0)
    }, 20000)

    it('pauses other playing videos when a new video starts playing', async () => {
      // Arrange
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)

      // Act
      await page.goto(url('/posts/safebooru.org?tags=multi_video_test'), { waitUntil: 'networkidle' })

      // Assert
      const videoPost1 = page.getByTestId(`safebooru.org-${mockPostsPageWithMultipleVideos.data[0].id}`).first()
      const videoPost2 = page.getByTestId(`safebooru.org-${mockPostsPageWithMultipleVideos.data[1].id}`).first()
      await videoPost1.waitFor({ state: 'visible' })
      await videoPost2.waitFor({ state: 'visible' })

      const videoElement1 = videoPost1.locator('video').first()
      const videoElement2 = videoPost2.locator('video').first()
      await videoElement1.waitFor({ state: 'attached' })
      await videoElement2.waitFor({ state: 'attached' })

      // Set up video 1 as playing
      await page.evaluate(
        ({ id1, id2 }) => {
          const v1 = document.querySelector<HTMLVideoElement>(`[data-testid="safebooru.org-${id1}"] video`)
          const v2 = document.querySelector<HTMLVideoElement>(`[data-testid="safebooru.org-${id2}"] video`)
          if (!v1 || !v2) throw new Error('video elements not found')

          let v1Paused = false
          Object.defineProperty(v1, 'paused', {
            get: () => v1Paused,
            set: (val: boolean) => {
              v1Paused = val
            },
            configurable: true
          })
          v1.pause = function () {
            v1Paused = true
            this.dispatchEvent(new Event('pause'))
          }

          let v2Paused = true
          Object.defineProperty(v2, 'paused', {
            get: () => v2Paused,
            set: (val: boolean) => {
              v2Paused = val
            },
            configurable: true
          })
          v2.pause = function () {
            v2Paused = true
            this.dispatchEvent(new Event('pause'))
          }

          v1.dispatchEvent(new Event('play'))
        },
        {
          id1: mockPostsPageWithMultipleVideos.data[0].id,
          id2: mockPostsPageWithMultipleVideos.data[1].id
        }
      )

      expect(await videoElement1.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(false)

      // Start playing video 2
      await page.evaluate(
        ({ id2 }) => {
          const v2 = document.querySelector<HTMLVideoElement>(`[data-testid="safebooru.org-${id2}"] video`)
          if (!v2) throw new Error('video 2 not found')
          v2.dispatchEvent(new Event('play'))
        },
        {
          id2: mockPostsPageWithMultipleVideos.data[1].id
        }
      )

      // Video 1 must now be paused by the global video coordinator
      expect(await videoElement1.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true)
    }, 20000)

    it('pauses video playback when scrolled out of viewport', async () => {
      // Arrange
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)

      // Act
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })

      const videoPost = page.getByTestId(`safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`).first()
      await videoPost.waitFor({ state: 'visible' })

      const videoElement = videoPost.locator('video').first()
      await videoElement.waitFor({ state: 'attached' })

      // Set up video as playing
      await page.evaluate((testId) => {
        const video = document.querySelector<HTMLVideoElement>(`[data-testid="${testId}"] video`)
        if (!video) throw new Error('video element not found')

        let isPaused = false
        Object.defineProperty(video, 'paused', {
          get: () => isPaused,
          set: (val: boolean) => {
            isPaused = val
          },
          configurable: true
        })
        video.pause = function () {
          isPaused = true
          this.dispatchEvent(new Event('pause'))
        }
      }, `safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`)

      expect(await videoElement.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(false)

      // Add a tall spacer and scroll far down past rootMargin (100px)
      await page.evaluate(() => {
        const spacer = document.createElement('div')
        spacer.id = 'test-scroll-spacer'
        spacer.style.height = '5000px'
        document.body.appendChild(spacer)
        window.scrollTo(0, 4000)
        window.dispatchEvent(new Event('scroll'))
      })

      // Wait for IntersectionObserver to detect the element out of view and trigger pause
      await page.waitForFunction(
        (testId) => {
          const video = document.querySelector<HTMLVideoElement>(`[data-testid="${testId}"] video`)
          return video?.paused === true
        },
        `safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`,
        { timeout: 5000 }
      )

      expect(await videoElement.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true)
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
      const firstPost = page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first()
      await firstPost.waitFor({ state: 'visible' })

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
      const firstPost = page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first()
      await firstPost.waitFor({ state: 'visible' })

      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight)
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        window.scrollTo(0, 0)
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      })

      await firstPost.getByRole('button', { name: /tags/i }).click()
      await page
        .getByRole('button', { name: /^1girl$/ })
        .first()
        .click()
      await Promise.all([
        page.waitForURL('**/posts/safebooru.org?tags=1girl'),
        page.getByRole('menuitem', { name: /set tag/i }).click()
      ])
      await page.getByTestId(`safebooru.org-${mockPostsPage1.data[0].id}`).first().waitFor({ state: 'visible' })

      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight)
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        window.scrollTo(0, 0)
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      })

      expect(errors).toEqual([])
    }, 30000)

    it('ignores non-renderable posts when building schema media entries', async () => {
      const page = await createTrackedPage()
      const pageErrors: string[] = []

      page.on('pageerror', (error) => {
        pageErrors.push(error.message)
      })

      await page.goto(url('/posts/safebooru.org?tags=unknown_media_test'), { waitUntil: 'domcontentloaded' })

      await page.getByRole('heading', { name: /no results/i }).waitFor({ state: 'visible' })

      expect(pageErrors).toEqual([])
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

  describe('Referrer policy', async () => {
    const META_ORIGIN = '<meta name="referrer" content="origin">'
    const META_NONE = '<meta name="referrer" content="no-referrer">'

    async function selectDomain(page: TrackedPage, domain: string) {
      await page.getByTestId('domain-selector').click({ force: true })
      const option = page.getByRole('option', { name: new RegExp(domain.replace('.', '\\.'), 'i') }).first()
      await option.waitFor({ state: 'visible' })
      const navigation = page.waitForURL(`**/posts/${domain}`, { waitUntil: 'commit' })
      await option.click({ force: true })
      await navigation
    }

    const referrerMetaContents = (page: TrackedPage) =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll('meta[name="referrer"]')).map((meta) => meta.getAttribute('content'))
      )

    // fetch() and <video> follow the same document policy, so one probe request shows what a video would send
    async function probeReferer(page: TrackedPage) {
      let referer: string | undefined
      await page.route('https://static1.e621.net/referrer-probe', (route) => {
        referer = route.request().headers()['referer']
        return route.fulfill({ status: 204 })
      })
      await page.evaluate(() => fetch('https://static1.e621.net/referrer-probe', { mode: 'no-cors' }))
      await page.unroute('https://static1.e621.net/referrer-probe')
      return referer
    }

    it('renders the origin referrer meta for e621 pages and no-referrer for other boorus', async () => {
      const page = await createTrackedPage()
      const htmlOf = async (path: string) => (await page.request.get(url(path))).text()

      for (const path of ['/posts/e621.net', '/es/posts/e621.net', '/posts/e621.net/hair_bun']) {
        expect(await htmlOf(path), path).toContain(META_ORIGIN)
      }

      for (const path of ['/posts/rule34.xxx', '/posts/safebooru.org', '/posts/safebooru.org/hair_bun']) {
        expect(await htmlOf(path), path).toContain(META_NONE)
      }
    }, 45000)

    it('sends the origin to e621 and nothing to other boorus', async () => {
      const page = await createTrackedPage()

      await page.goto(url('/posts/e621.net'), { waitUntil: 'networkidle' })
      expect(await referrerMetaContents(page)).toEqual(['origin'])
      expect(await probeReferer(page)).toBe(`${new URL(url('/')).origin}/`)

      await page.goto(url('/posts/rule34.xxx'), { waitUntil: 'networkidle' })
      expect(await referrerMetaContents(page)).toEqual(['no-referrer'])
      expect(await probeReferer(page)).toBeUndefined()
    }, 45000)

    it('sends the origin on the real e621 <video> request, and nothing for other boorus', async () => {
      const page = await createTrackedPage()
      const referers: Record<string, string | undefined> = {}
      await page.route(/(static1\.e621\.net|example\.local)\//, (route) => {
        const requestUrl = route.request().url()
        if (/\.(mp4|webm)$/.test(requestUrl)) {
          referers[new URL(requestUrl).host] = route.request().headers()['referer']
          return route.fulfill({ status: 200, contentType: 'audio/wav', body: createSilentWav() })
        }
        return route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL_PNG })
      })
      const forceVideoRequest = (testIdPrefix: string) =>
        page.evaluate((prefix) => {
          const video = document.querySelector<HTMLVideoElement>(`[data-testid^="${prefix}"] video`)!
          video.preload = 'metadata'
          video.load()
        }, testIdPrefix)

      await page.goto(url('/posts/e621.net?tags=video_test'), { waitUntil: 'networkidle' })
      await forceVideoRequest('e621.net-')
      await expect.poll(() => referers['static1.e621.net']).toBe(`${new URL(url('/')).origin}/`)

      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })
      await forceVideoRequest('safebooru.org-')
      await expect.poll(() => 'example.local' in referers).toBe(true)
      expect(referers['example.local']).toBeUndefined()
    }, 60000)

    it('keeps everything except the e621 media on no-referrer, even on an e621 page', async () => {
      const page = await createTrackedPage()
      const requests: Array<{ host: string; referer: string | undefined }> = []
      page.on('request', (request) =>
        requests.push({ host: new URL(request.url()).host, referer: request.headers()['referer'] })
      )

      await page.goto(url('/posts/e621.net'), { waitUntil: 'networkidle' })
      await page.getByTestId('domain-selector').waitFor({ state: 'visible' })

      // Cross-origin elements the page renders (favicons, iframes, scripts) must opt out of the page policy
      const unpinned = await page.evaluate(() => {
        const pinnable = Array.from(document.querySelectorAll<HTMLElement>('img[src], iframe[src], script[src]'))

        return pinnable
          .filter((element) => {
            const target = new URL((element as HTMLImageElement).src, location.href)
            return target.origin !== location.origin && !target.host.endsWith('e621.net')
          })
          .filter((element) => (element as HTMLImageElement).referrerPolicy !== 'no-referrer')
          .map((element) => `${element.tagName} ${(element as HTMLImageElement).src}`)
      })
      expect(unpinned).toEqual([])

      const favicons = requests.filter((request) => request.host.endsWith('google.com'))
      expect(favicons.length).toBeGreaterThan(0)
      expect(favicons.map((request) => request.referer)).toEqual(favicons.map(() => undefined))
    }, 60000)

    it('follows in-app domain switches without a reload', async () => {
      const page = await createTrackedPage()
      await page.goto(url('/posts/rule34.xxx'), { waitUntil: 'networkidle' })
      await page.getByTestId('domain-selector').waitFor({ state: 'visible' })
      expect(await probeReferer(page)).toBeUndefined()

      await selectDomain(page, 'e621.net')
      await page.waitForSelector('meta[name="referrer"][content="origin"]', { state: 'attached' })
      expect(await referrerMetaContents(page)).toEqual(['origin'])
      expect(await probeReferer(page)).toBe(`${new URL(url('/')).origin}/`)

      await selectDomain(page, 'safebooru.org')
      await page.waitForSelector('meta[name="referrer"][content="no-referrer"]', { state: 'attached' })
      expect(await referrerMetaContents(page)).toEqual(['no-referrer'])
      expect(await probeReferer(page)).toBeUndefined()
    }, 60000)

    it('falls back to no-referrer when navigating from e621 to a non-posts page without a reload', async () => {
      const page = await createTrackedPage()
      await page.goto(url('/posts/e621.net'), { waitUntil: 'networkidle' })
      expect(await referrerMetaContents(page)).toEqual(['origin'])

      // Client-side navigation through a layout link, so the document (and its policy) stays alive
      await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true))
      await page.getByRole('button', { name: /open main menu/i }).click()
      await page
        .getByRole('link', { name: /^premium$/i })
        .first()
        .click()
      await page.waitForURL('**/premium')
      await page.waitForSelector('meta[name="referrer"][content="no-referrer"]', { state: 'attached' })

      expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true)
      expect(await referrerMetaContents(page)).toEqual(['no-referrer'])
      expect(await probeReferer(page)).toBeUndefined()
    }, 60000)
  })

  describe('Console and navigation health', async () => {
    it('keeps the console clean on posts pages', async () => {
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)
      await page.route(/static1\.e621\.net/, (route) =>
        route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL_PNG })
      )
      const problems = collectConsoleProblems(page)

      for (const path of [
        '/posts/rule34.xxx',
        '/posts/safebooru.org?tags=video_test',
        '/posts/e621.net?tags=video_test'
      ]) {
        await page.goto(url(path), { waitUntil: 'networkidle' })
        await page.waitForTimeout(500)
      }

      expect(problems).toEqual([])
    }, 60000)

    it('keeps the console clean as a premium user', async () => {
      const page = await createTrackedPage()
      await signInAsPremiumUser(page)
      await mockReachableVideoPosters(page)
      const problems = collectConsoleProblems(page)

      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)

      expect(problems).toEqual([])
    }, 45000)

    it('returns to a video page from Premium without errors or a reload', async () => {
      const page = await createTrackedPage()
      await mockReachableVideoPosters(page)
      const problems = collectConsoleProblems(page)
      const videoPost = page.getByTestId(`safebooru.org-${mockPostsPageWithVideoMedia.data[0].id}`).first()

      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })
      await videoPost.waitFor()
      await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true))

      await pushRoute(page, '/premium')
      await page.waitForURL('**/premium')
      await page.goBack()

      // Going back refetches, so the list is rebuilt once: keep nudging the (new) video into view until it upgrades
      await expect
        .poll(
          async () => {
            await page.evaluate(() => document.querySelector('video')?.scrollIntoView({ block: 'center' }))
            return videoPost.locator('.fluid_video_wrapper').count()
          },
          { timeout: 15000 }
        )
        .toBe(1)

      expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true)
      expect(problems).toEqual([])
    }, 60000)

    it('applies the destination referrer policy to media requested right after an in-app navigation', async () => {
      const page = await createTrackedPage()
      const referers = { e621: [] as Array<string | undefined>, other: [] as Array<string | undefined> }
      await page.route(/(static1\.e621\.net|example\.local)\//, (route) => {
        const request = route.request()
        const isE621 = request.url().includes('e621.net')
        ;(isE621 ? referers.e621 : referers.other).push(request.headers()['referer'])
        return route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL_PNG })
      })
      const origin = `${new URL(url('/')).origin}/`

      // Other booru -> e621: the e621 media must already carry the origin
      await page.goto(url('/posts/safebooru.org?tags=video_test'), { waitUntil: 'networkidle' })
      referers.other.length = 0
      await pushRoute(page, '/posts/e621.net?tags=video_test')
      await expect.poll(() => referers.e621.length).toBeGreaterThan(0)
      expect(referers.e621).toEqual(referers.e621.map(() => origin))

      // e621 -> other booru: its media must not inherit the origin
      referers.other.length = 0
      await pushRoute(page, '/posts/safebooru.org?tags=multi_video_test') // other posters, so none is served from cache
      await expect.poll(() => referers.other.length).toBeGreaterThan(0)
      expect(referers.other).toEqual(referers.other.map(() => undefined))
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

    it('displays upstream booru link pointing to the authoritative domain with security attributes', async () => {
      // Arrange
      const page = await createTrackedPage()

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })
      await page.getByTestId('domain-selector').waitFor({ state: 'visible' })

      const externalLink = page.getByRole('link', { name: /visit safebooru\.org/i })
      await externalLink.waitFor({ state: 'visible' })

      expect(await externalLink.getAttribute('href')).toBe('https://safebooru.org')
      expect(await externalLink.getAttribute('target')).toBe('_blank')
      expect(await externalLink.getAttribute('rel')).toContain('noopener')
      expect(await externalLink.getAttribute('rel')).toContain('noreferrer')
      expect(await externalLink.getAttribute('rel')).toContain('nofollow')
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
    it('autocompletes tags in the search dialog', async () => {
      // Arrange
      const page = await createTrackedPage()

      await page.route('**/booru/*/tags*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                name: 'cat_ears',
                type: 'general',
                count: 42
              }
            ]
          })
        })
      })

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })
      await page.getByLabel('Search posts').click()

      const dialog = page.getByRole('dialog')
      const input = dialog.getByRole('combobox')
      await input.waitFor({ state: 'visible', timeout: 10000 })
      await input.click()
      await input.pressSequentially('cat', { delay: 50 })

      // Assert
      const option = dialog.getByRole('option', { name: /cat_ears/ })
      await option.waitFor({ state: 'visible', timeout: 10000 })
      expect(await option.textContent()).toContain('cat_ears')
    }, 30000)

    it('keeps suggestions in sync with the latest query when responses arrive out of order', async () => {
      // Arrange
      const page = await createTrackedPage()

      let tagSearchRequests = 0

      await page.route('**/booru/*/tags*', async (route) => {
        tagSearchRequests += 1
        const isFirstQuery = tagSearchRequests === 1
        if (isFirstQuery) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                name: isFirstQuery ? 'albatross' : 'albert_einstein',
                type: 'general',
                count: 1
              }
            ]
          })
        })
      })

      // Act
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'domcontentloaded' })
      await page.getByLabel('Search posts').click()
      const dialog = page.getByRole('dialog')
      const input = dialog.getByRole('combobox')
      await input.waitFor({ state: 'visible', timeout: 10000 })
      await input.click()
      await input.pressSequentially('al', { delay: 50 })
      await new Promise((resolve) => setTimeout(resolve, 400))
      await input.pressSequentially('bert', { delay: 50 })
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const staleOption = dialog.getByRole('option', { name: /albatross/ })
      const freshOption = dialog.getByRole('option', { name: /albert_einstein/ })
      await freshOption.waitFor({ state: 'visible', timeout: 10000 })
      expect(await staleOption.count()).toBe(0)
      expect(await freshOption.count()).toBe(1)
      expect(tagSearchRequests).toBe(2)
    }, 30000)
  })
})
