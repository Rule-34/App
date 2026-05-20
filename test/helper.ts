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

export const defaultSetupConfig: TestOptions = {
  browser: true,
  browserOptions: defaultBrowserOptions,
  env: {
    NUXT_PUBLIC_API_URL: ''
  }
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
