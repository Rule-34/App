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
    it.each(['/posts/safebooru.org', '/es/posts/safebooru.org', '/posts/safebooru.org/hair_bun'])(
      'is identical for anonymous and premium visitors and carries no account data: %s',
      async (path) => {
        const anonymous = await (await fetch(path)).text()
        const premium = await (await fetch(path, { headers: { cookie: `pb_auth=${authValue}` } })).text()

        expect(firstDifference(withoutNonces(anonymous), withoutNonces(premium))).toBeNull()
        expect(premium).not.toContain(email)
        expect(premium).not.toContain(license)
      }
    )
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

  describe('premium-only booru gate', () => {
    it.each(['/posts/gelbooru.com', '/posts/gelbooru.com/hair_bun'])(
      'keeps posts out of the shared HTML and out of search engines: %s',
      async (path) => {
        const response = await fetch(path, { redirect: 'manual' })
        const html = await response.text()

        expect(response.status).toBe(200)
        expect(html).toMatch(/<meta[^>]+name="robots"[^>]+content="noindex, nofollow"/)
        expect(html).not.toContain(`data-testid="gelbooru.com-${mockPostsPage0.data[0].id}"`)
      }
    )

    it('sends a free visitor to the free booru', async () => {
      const page = await createTrackedPage()

      await page.goto(url('/posts/gelbooru.com?tags=hair_bun'), { waitUntil: 'networkidle' })

      const landed = new URL(page.url())
      expect(landed.pathname).toBe('/posts/rule34.xxx')
      expect(landed.searchParams.get('utm_medium')).toBe('unauthorized-booru-redirect')
      expect(landed.searchParams.get('tags')).toBe('hair_bun')
    }, 45000)

    it('lets a premium visitor in on a cold load', async () => {
      const page = await createTrackedPage()
      const problems = collectPageProblems(page)
      await signInAsPremiumUser(page, 'cookie')

      await page.goto(url('/posts/gelbooru.com'), { waitUntil: 'networkidle' })
      await page.getByTestId(`gelbooru.com-${mockPostsPage0.data[0].id}`).first().waitFor({ state: 'visible' })

      expect(new URL(page.url()).pathname).toBe('/posts/gelbooru.com')
      expect(await readNuxtError(page)).toBeNull()
      expect(problems).toEqual([])
    }, 45000)
  })
})
