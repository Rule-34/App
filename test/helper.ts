import { createPage, type TestOptions, url } from '@nuxt/test-utils'
import { afterEach } from 'vitest'

const transparentImage = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64'
)

async function mockExternalImages(page: Awaited<ReturnType<typeof createPage>>) {
  await page.route(/https:\/\/(imgproxy2\.r34\.app|safebooru\.org|rule34\.xxx)\//, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: transparentImage
    })
  })
}

export const defaultBrowserOptions: TestOptions['browserOptions'] = {
  type: 'chromium'
}

/**
 * Use alongside page.pause() to debug tests
 * and it(<>, 99999)
 */
export const debugBrowserOptions: TestOptions['browserOptions'] = {
  type: 'chromium',
  launch: {
    headless: false,
    slowMo: 1000,
    devtools: true
  }
}

export const defaultSetupConfig: Partial<TestOptions> = {
  browser: true,
  browserOptions: defaultBrowserOptions,
  setupTimeout: 180000,
  serverStartTimeout: 120000,
  env: {
    NUXT_PUBLIC_API_URL: ''
  }
}

export const serverSetupConfig: Partial<TestOptions> = {
  server: true,
  browser: false,
  setupTimeout: 180000,
  serverStartTimeout: 120000,
  env: {
    NUXT_PUBLIC_API_URL: ''
  }
}

export type TrackedPage = Awaited<ReturnType<typeof createPage>>

/** Page errors, console errors and Vue/hydration warnings, without the mocked-network noise. */
export function collectConsoleProblems(page: TrackedPage) {
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

/** Writes `localStorage` before any page script runs, like a returning visitor. */
export function seedLocalStorage(page: TrackedPage, entries: Record<string, string>) {
  return page.addInitScript((values) => {
    for (const [key, value] of Object.entries(values)) window.localStorage.setItem(key, value)
  }, entries)
}

/** Posts requests made by the browser (the server's own fetches are not observable here). */
export function collectPostsRequests(page: TrackedPage) {
  const requests: URLSearchParams[] = []

  page.on('request', (request) => {
    const requestUrl = new URL(request.url())

    if (requestUrl.pathname.startsWith('/booru/') && requestUrl.pathname.endsWith('/posts')) {
      requests.push(requestUrl.searchParams)
    }
  })

  return requests
}

/** Client-side navigation, so the browser fetches the data and the document stays alive. */
export async function pushRoute(page: TrackedPage, path: string) {
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

export function readNuxtError(page: TrackedPage) {
  return page.evaluate(() => {
    const app = (
      document.querySelector('#__nuxt') as unknown as {
        __vue_app__: { config: { globalProperties: { $nuxt: { payload: { error?: { message?: string } } } } } }
      }
    ).__vue_app__

    return app.config.globalProperties.$nuxt.payload.error?.message ?? null
  })
}

export function useTrackedPageFactory() {
  const pages = new Set<Awaited<ReturnType<typeof createPage>>>()

  afterEach(async () => {
    await Promise.all(
      Array.from(pages, async (page) => {
        try {
          await page.close()
        } catch {
          // Ignore already-closed or torn-down pages during cleanup.
        }
      })
    )

    pages.clear()
  })

  return async function createTrackedPage(path?: string) {
    const page = await createPage()
    pages.add(page)

    await mockExternalImages(page)

    if (path != null) {
      await page.goto(url(path))
    }

    return page
  }
}
