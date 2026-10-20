import { describe, expect, it } from 'vitest'
import { fetch, setup, url } from '@nuxt/test-utils'
import { mockPostsPage0 } from './posts.mock-data'
import { defaultSetupConfig, useTrackedPageFactory } from '../helper'

type TrackedPage = Awaited<ReturnType<ReturnType<typeof useTrackedPageFactory>>>

const license = 'SLX-TEST-LICENSE-0001'
const email = 'premium-ssr@example.test'
const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 86400 })}.sig`
const record = {
  id: 'premium-ssr-user',
  collectionName: 'users',
  email,
  username: license,
  subscription_expires_at: new Date(Date.now() + 86400_000).toISOString()
}
const authValue = encodeURIComponent(JSON.stringify({ token, model: record }))

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

/** Fake premium session: the SDK only decodes the JWT expiry, and auth-refresh is answered locally. */
async function signInAsPremiumUser(page: TrackedPage, via: 'cookie' | 'localStorage') {
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

  if (via === 'cookie') {
    await page.context().addCookies([{ name: 'pb_auth', value: authValue, url: url('/') }])
    return
  }

  await page.addInitScript(
    (value) => window.localStorage.setItem('pocketbase_auth', decodeURIComponent(value)),
    authValue
  )
}

function collectPageProblems(page: TrackedPage) {
  const problems: string[] = []

  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (/Vue warn|Hydration/.test(message.text())) problems.push(`${message.type()}: ${message.text().slice(0, 200)}`)
  })

  return problems
}

function readNuxtError(page: TrackedPage) {
  return page.evaluate(() => {
    const app = (
      document.querySelector('#__nuxt') as unknown as {
        __vue_app__: { config: { globalProperties: { $nuxt: { payload: { error?: { message?: string } } } } } }
      }
    ).__vue_app__

    return app.config.globalProperties.$nuxt.payload.error?.message ?? null
  })
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
      const anonymous = await (await fetch(path)).text()
      const premium = await (await fetch(path, { headers: { cookie: `pb_auth=${authValue}` } })).text()

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
        const problems = collectPageProblems(page)
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
      const problems = collectPageProblems(page)

      await page.goto(url('/posts/safebooru.org'), { waitUntil: 'networkidle' })
      await page.getByTestId(`safebooru.org-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      expect(await page.locator(freeOnlyButton).count()).toBeGreaterThan(0)
      expect(await readNuxtError(page)).toBeNull()
      expect(problems).toEqual([])
    }, 45000)
  })

  describe('premium-only booru preview', () => {
    const previewPostLimit = 7
    const promotion = '[data-testid="premium-booru-promotion"]'

    /** Scrolls to the end of the virtualized list until it renders a row at or past `index`. */
    async function scrollToRow(page: TrackedPage, index: number) {
      await expect
        .poll(
          () =>
            page.evaluate(() => {
              window.scrollTo(0, document.body.scrollHeight)
              return Math.max(
                -1,
                ...[...document.querySelectorAll('li[data-index]')].map((li) => Number(li.getAttribute('data-index')))
              )
            }),
          { timeout: 20000 }
        )
        .toBeGreaterThanOrEqual(index)
    }

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
      const problems = collectPageProblems(page)

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
      await page.getByTestId('domain-selector').click({ force: true })

      const option = page.getByRole('option', { name: /gelbooru\.com/i }).first()
      await option.waitFor({ state: 'visible' })
      expect(await option.textContent()).toContain('Premium')

      await option.click({ force: true })
      await page.waitForURL('**/posts/gelbooru.com')
      await page.getByTestId(`gelbooru.com-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      expect(await page.getByRole('dialog').count()).toBe(0)
    }, 45000)

    it('shows a premium visitor every post on a cold load', async () => {
      const page = await createTrackedPage()
      const problems = collectPageProblems(page)
      await signInAsPremiumUser(page, 'cookie')

      await page.goto(url('/posts/gelbooru.com'), { waitUntil: 'networkidle' })
      await page.getByTestId(`gelbooru.com-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })
      await scrollToRow(page, previewPostLimit + 1)

      expect(await page.locator(promotion).count()).toBe(0)
      expect(await readNuxtError(page)).toBeNull()
      expect(problems).toEqual([])
    }, 45000)
  })
})
