import { describe, expect, it } from 'vitest'
import { setup, url } from '@nuxt/test-utils'
import { mockPostsPage0 } from './posts.mock-data'
import { defaultSetupConfig, useTrackedPageFactory } from '../helper'

type TrackedPage = Awaited<ReturnType<ReturnType<typeof useTrackedPageFactory>>>

const firstPost = mockPostsPage0.data[0]
const firstPostTestId = `safebooru.org-${firstPost.id}`

/** Client-side navigation, so the posts are fetched by the browser (observable and routable) instead of the SSR. */
async function pushRoute(page: TrackedPage, path: string) {
  // The router only exists once the app has hydrated
  await page.waitForFunction(() => (document.querySelector('#__nuxt') as { __vue_app__?: unknown } | null)?.__vue_app__)

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

/** The first SSR posts go through imgproxy, which base64url-encodes the source; compare on the decoded source. */
function sourceOf(src: string | null) {
  if (!src?.startsWith('https://imgproxy2.r34.app/')) {
    return src
  }

  const encoded = src.split('/').pop()!.replace(/-/g, '+').replace(/_/g, '/')

  return Buffer.from(encoded, 'base64').toString('utf8').replace('http://nginx-proxy/proxy?url=', '')
}

function readImageSource(page: TrackedPage, testId: string) {
  return page.evaluate((id) => document.querySelector(`[data-testid="${id}"] img`)?.getAttribute('src') ?? null, testId)
}

function readStoredSetting(page: TrackedPage, key: string) {
  return page.evaluate((storageKey) => window.localStorage.getItem(storageKey), key)
}

function seedSetting(page: TrackedPage, key: string, value: string) {
  return page.addInitScript(([storageKey, storageValue]) => window.localStorage.setItem(storageKey, storageValue), [
    key,
    value
  ] as const)
}

describe('Settings', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()

  describe('Full size images', () => {
    it('shows the sample image by default', async () => {
      const page = await createTrackedPage('/posts/safebooru.org')

      await page.getByTestId(firstPostTestId).first().waitFor({ state: 'visible' })

      expect(sourceOf(await readImageSource(page, firstPostTestId))).toBe(firstPost.low_res_file.url)
    })

    it('switches to the full size image once toggled, and remembers it after a reload', async () => {
      const page = await createTrackedPage('/settings')

      const toggle = page.getByRole('switch', { name: /Full size images/ })
      await toggle.waitFor({ state: 'visible' })
      await toggle.click()

      await expect.poll(() => readStoredSetting(page, 'settings-postFullSizeImages')).toBe('true')

      await page.goto(url('/posts/safebooru.org'))
      await page.getByTestId(firstPostTestId).first().waitFor({ state: 'visible' })

      await expect
        .poll(async () => sourceOf(await readImageSource(page, firstPostTestId)))
        .toBe(firstPost.high_res_file.url)

      await page.goto(url('/settings'))
      await expect
        .poll(() => page.getByRole('switch', { name: /Full size images/ }).getAttribute('aria-checked'))
        .toBe('true')
    })

    it('goes back to the sample image when toggled off', async () => {
      const page = await createTrackedPage()
      await seedSetting(page, 'settings-postFullSizeImages', 'true')
      await page.goto(url('/settings'))

      const toggle = page.getByRole('switch', { name: /Full size images/ })
      await expect.poll(() => toggle.getAttribute('aria-checked')).toBe('true')
      await toggle.click()
      await expect.poll(() => toggle.getAttribute('aria-checked')).toBe('false')

      await pushRoute(page, '/posts/safebooru.org')
      await page.getByTestId(firstPostTestId).first().waitFor({ state: 'visible' })

      expect(sourceOf(await readImageSource(page, firstPostTestId))).toBe(firstPost.low_res_file.url)
    })
  })

  describe('Posts per page', () => {
    async function collectPostsLimits(page: TrackedPage) {
      const limits: string[] = []

      page.on('request', (request) => {
        const requestUrl = new URL(request.url())

        if (requestUrl.pathname.startsWith('/booru/') && requestUrl.pathname.endsWith('/posts')) {
          limits.push(requestUrl.searchParams.get('limit') ?? '')
        }
      })

      return limits
    }

    it('requests 29 posts by default', async () => {
      const page = await createTrackedPage('/settings')
      const limits = await collectPostsLimits(page)

      await pushRoute(page, '/posts/safebooru.org')
      await page.getByTestId(firstPostTestId).first().waitFor({ state: 'visible' })

      expect(limits).toContain('29')
    })

    it('requests the configured amount of posts', async () => {
      const page = await createTrackedPage('/settings')

      await page.getByLabel(/Posts per page/).fill('12')
      await expect.poll(() => readStoredSetting(page, 'settings-postsPerPage')).toBe('12')

      const limits = await collectPostsLimits(page)

      await pushRoute(page, '/posts/safebooru.org')
      await page.getByTestId(firstPostTestId).first().waitFor({ state: 'visible' })

      expect(limits).toContain('12')
      expect(limits).not.toContain('29')
    })
  })

  describe('Block AI posts', () => {
    const blockedMessage = 'One of your selected tags is in the block list'

    it('refuses to search an AI tag once enabled, and allows it again once disabled', async () => {
      const page = await createTrackedPage('/settings')

      const toggle = page.getByRole('switch', { name: /Block AI posts/ })
      await toggle.waitFor({ state: 'visible' })
      await toggle.click()
      await expect.poll(() => readStoredSetting(page, 'settings-blockAiGeneratedImages')).toBe('true')

      await pushRoute(page, '/posts/safebooru.org?tags=ai_generated')
      await page.getByText(blockedMessage).first().waitFor({ state: 'visible', timeout: 10000 })

      await pushRoute(page, '/settings')
      await toggle.click()
      await expect.poll(() => readStoredSetting(page, 'settings-blockAiGeneratedImages')).toBe('false')

      await pushRoute(page, '/posts/safebooru.org?tags=ai_generated')
      await page.getByTestId(firstPostTestId).first().waitFor({ state: 'visible', timeout: 10000 })
      expect(await page.getByText(blockedMessage).count()).toBe(0)
    })
  })

  describe('Autoplay GIFs', () => {
    async function routeAnimatedFirstPost(page: TrackedPage) {
      const gifUrl = 'https://safebooru.org/images/4227/animated-test.gif'
      const animatedPost = {
        ...firstPost,
        media_type: 'animated',
        high_res_file: { ...firstPost.high_res_file, url: gifUrl },
        low_res_file: { ...firstPost.low_res_file, url: gifUrl }
      }

      await page.route(/\/booru\/[^/]+\/posts\?/, (route) =>
        route.fulfill({ json: { ...mockPostsPage0, data: [animatedPost, ...mockPostsPage0.data.slice(1)] } })
      )

      return gifUrl
    }

    it('waits for a click to play by default', async () => {
      const page = await createTrackedPage('/settings')
      const gifUrl = await routeAnimatedFirstPost(page)

      await pushRoute(page, '/posts/safebooru.org')

      const play = page.getByTestId(firstPostTestId).first().getByRole('button', { name: 'Play' })
      await play.waitFor({ state: 'visible', timeout: 10000 })

      expect(sourceOf(await readImageSource(page, firstPostTestId))).not.toBe(gifUrl)

      await play.click()
      await expect.poll(() => readImageSource(page, firstPostTestId)).toBe(gifUrl)
    })

    it('plays right away once enabled', async () => {
      const page = await createTrackedPage()
      await seedSetting(page, 'settings-autoplayAnimatedMedia', 'true')
      await page.goto(url('/settings'))
      const gifUrl = await routeAnimatedFirstPost(page)

      await pushRoute(page, '/posts/safebooru.org')

      await page.getByTestId(firstPostTestId).first().waitFor({ state: 'visible', timeout: 10000 })

      await expect.poll(() => readImageSource(page, firstPostTestId), { timeout: 10000 }).toBe(gifUrl)
      expect(await page.getByTestId(firstPostTestId).first().getByRole('button', { name: 'Play' }).count()).toBe(0)
    })
  })

  describe('Reset', () => {
    it('clears every stored setting and restores the defaults', async () => {
      const page = await createTrackedPage('/settings')

      const toggle = page.getByRole('switch', { name: /Full size images/ })
      await toggle.click()
      await expect.poll(() => readStoredSetting(page, 'settings-postFullSizeImages')).toBe('true')

      page.once('dialog', (dialog) => void dialog.accept())

      await Promise.all([page.waitForEvent('load'), page.locator('#reset').click()])

      expect(await readStoredSetting(page, 'settings-postFullSizeImages')).toBeNull()
      await expect.poll(() => toggle.getAttribute('aria-checked')).toBe('false')
    })
  })
})
