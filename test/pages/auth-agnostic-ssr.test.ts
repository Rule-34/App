import { describe, expect, it } from 'vitest'
import { fetch, setup, url } from '@nuxt/test-utils'
import { mockPostsPage0 } from './posts.mock-data'
import {
  collectConsoleProblems,
  collectPostsRequests,
  defaultSetupConfig,
  readNuxtError,
  scrollToRow,
  seedLocalStorage,
  useTrackedPageFactory
} from '../helper'
import { premiumSession, signInAsPremiumUser } from '../pocketbase-mock'
import { premiumBooruPreviewLimit as previewPostLimit } from '../../app/assets/js/promotions'
import { defaultPostsPerPage } from '../../app/composables/useUserSettings'
import { project } from '../../config/project'

const { authValue, record } = premiumSession
const { email, username: license } = record

/** CSP nonces are random per request; everything else must be identical for every visitor. */
const withoutNonces = (html: string) =>
  html
    .replace(/nonce="[^"]*"/g, 'nonce=""')
    // Query cache timestamps in the serialized state
    .replace(/\b1\d{12}\b/g, '0')

/** Only free visitors get the AI button (a placeholder in the SSR HTML, the real one after hydration). */
const freeOnlyButton = 'button[aria-label="Chat with AI"]'

/** First difference between two documents, so a failure points at the markup that depends on the visitor. */
function firstDifference(a: string, b: string) {
  let index = 0

  while (index < a.length && index < b.length && a[index] === b[index]) index++

  if (index === a.length && index === b.length) return null

  return { at: index, anonymous: a.slice(index - 80, index + 160), premium: b.slice(index - 80, index + 160) }
}

describe('Server rendering does not depend on the visitor', async () => {
  await setup(defaultSetupConfig)

  const createTrackedPage = useTrackedPageFactory()

  describe('shared HTML', () => {
    it.each([
      '/posts/safebooru.org',
      '/es/posts/safebooru.org',
      '/posts/safebooru.org/hair_bun',
      '/posts/gelbooru.com',
      '/posts/gelbooru.com/hair_bun'
    ])('is identical for anonymous and premium visitors and carries no account data: %s', async (path) => {
      const [anonymous, premium] = await Promise.all([
        fetch(path).then((response) => response.text()),
        fetch(path, { headers: { cookie: `pb_auth=${authValue}` } }).then((response) => response.text())
      ])

      expect(firstDifference(withoutNonces(anonymous), withoutNonces(premium))).toBeNull()
      expect(premium).not.toContain(email)
      expect(premium).not.toContain(license)
    })
  })

  describe('hydration', () => {
    it.each(['cookie', 'localStorage'] as const)(
      'hydrates a premium visitor (%s session) from the anonymous HTML without errors',
      async (via) => {
        const page = await createTrackedPage()
        const problems = collectConsoleProblems(page)
        await signInAsPremiumUser(page, via)

        await page.goto(url('/posts/safebooru.org'), { waitUntil: 'networkidle' })
        await page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

        // The premium UI is applied once the app has mounted
        await expect.poll(() => page.locator(freeOnlyButton).count()).toBe(0)
        expect(await readNuxtError(page)).toBeNull()
        expect(problems).toEqual([])
      },
      45000
    )

    it('keeps an anonymous visitor on the free UI', async () => {
      const page = await createTrackedPage()
      const problems = collectConsoleProblems(page)

      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'networkidle' })
      await page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      expect(await page.locator(freeOnlyButton).count()).toBeGreaterThan(0)
      expect(await readNuxtError(page)).toBeNull()
      expect(problems).toEqual([])
    }, 45000)
  })

  describe('premium-only booru preview', () => {
    const promotion = '[data-testid="premium-booru-promotion"]'

    const firstPostId = mockPostsPage0.data[0].id

    it.each([
      ['/posts/gelbooru.com', `data-testid="gelbooru.com-${firstPostId}"`],
      ['/posts/gelbooru.com/hair_bun', `#${firstPostId}`]
    ])('renders posts in the shared HTML and lets search engines index them: %s', async (path, firstPost) => {
      const response = await fetch(path, { redirect: 'manual' })
      const html = await response.text()

      expect(response.status).toBe(200)
      expect(html).not.toMatch(/<meta[^>]+name="robots"[^>]+noindex/)
      expect(html).toContain(firstPost)
    })

    it('shows a free visitor the first posts, then the premium promotion', async () => {
      expect(mockPostsPage0.data.length).toBeGreaterThan(previewPostLimit)

      const page = await createTrackedPage()
      const problems = collectConsoleProblems(page)

      await page.goto(url('/posts/gelbooru.com?tags=hair_bun'), { waitUntil: 'networkidle' })
      await scrollToRow(page, previewPostLimit)

      await expect.poll(() => page.locator(`li[data-index="${previewPostLimit}"] ${promotion}`).count()).toBe(1)
      expect(await page.locator(`li[data-index="${previewPostLimit + 1}"]`).count()).toBe(0)
      expect(await page.getByTestId('load-next-page').count()).toBe(0)
      expect(new URL(page.url()).pathname).toBe('/posts/gelbooru.com')
      expect(await readNuxtError(page)).toBeNull()
      expect(problems).toEqual([])
    }, 45000)

    it('opens the preview from the domain menu, with the premium badge', async () => {
      const page = await createTrackedPage()

      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'networkidle' })
      await page.getByTestId('domain-selector').click()

      const option = page.getByRole('option', { name: /gelbooru\.com/i }).first()
      await option.waitFor({ state: 'visible' })
      expect(await option.textContent()).toContain('Premium')

      await option.click()
      await page.waitForURL('**/posts/gelbooru.com')
      await page.getByTestId(`gelbooru.com-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      expect(await page.getByRole('dialog').count()).toBe(0)
      // The origin only works through imgproxy, even on a client-side navigation
      expect(await page.locator('li[data-index="0"] img').first().getAttribute('src')).toContain(
        project.imgproxy.baseUrl
      )
    }, 45000)

    it('shows a premium visitor every post on a cold load', async () => {
      const page = await createTrackedPage()
      const problems = collectConsoleProblems(page)
      await signInAsPremiumUser(page, 'cookie')

      await page.goto(url('/posts/gelbooru.com'), { waitUntil: 'networkidle' })
      await page.getByTestId(`gelbooru.com-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })
      await scrollToRow(page, previewPostLimit + 1)

      expect(await page.locator(promotion).count()).toBe(0)
      expect(await readNuxtError(page)).toBeNull()
      expect(problems).toEqual([])
    }, 45000)

    it.each([
      '/posts/gelbooru.com?page=3',
      '/posts/gelbooru.com?tags=hair_bun|1girl',
      '/posts/gelbooru.com?filter[sort]=score'
    ])(
      'shows a free visitor only the premium promotion beyond the preview: %s',
      async (path) => {
        const page = await createTrackedPage()
        const problems = collectConsoleProblems(page)
        const requests = collectPostsRequests(page)

        const html = await (await fetch(path)).text()
        expect(html).not.toContain(`data-testid="gelbooru.com-${firstPostId}"`)

        await page.goto(url(path), { waitUntil: 'networkidle' })

        await expect.poll(() => page.locator(promotion).count()).toBe(1)
        expect(await page.locator('li[data-index]').count()).toBe(0)
        expect(requests).toEqual([])
        expect(await readNuxtError(page)).toBeNull()
        expect(problems).toEqual([])
      },
      45000
    )

    it('previews at the default page size, whatever the posts-per-page setting', async () => {
      const page = await createTrackedPage()
      const requests = collectPostsRequests(page)

      await seedLocalStorage(page, { 'settings-postsPerPage': '7' })
      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'networkidle' })
      await page.getByTestId('domain-selector').click()
      await page
        .getByRole('option', { name: /gelbooru\.com/i })
        .first()
        .click()
      await page.getByTestId(`gelbooru.com-${firstPostId}`).first().waitFor({ state: 'visible' })

      const gelbooruLimits = requests
        .filter((params) => params.get('baseEndpoint') === 'gelbooru.com')
        .map((params) => params.get('limit'))
      expect(gelbooruLimits).toEqual([String(defaultPostsPerPage)])
    }, 45000)

    it('loads the requested page for a premium visitor', async () => {
      const page = await createTrackedPage()
      const problems = collectConsoleProblems(page)
      const requests = collectPostsRequests(page)
      await signInAsPremiumUser(page, 'cookie')

      await page.goto(url('/posts/gelbooru.com?page=3'), { waitUntil: 'networkidle' })
      await expect.poll(() => page.locator('li[data-index="0"]').count()).toBe(1)

      expect(requests.map((params) => params.get('pageID'))).toEqual(['3'])
      expect(await page.locator(promotion).count()).toBe(0)
      expect(await readNuxtError(page)).toBeNull()
      expect(problems).toEqual([])
    }, 45000)
  })
})
