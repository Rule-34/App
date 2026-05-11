import { createPage, type TestOptions } from '@nuxt/test-utils'
import { afterEach } from 'vitest'

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
    const page = path == null ? await createPage() : await createPage(path)

    pages.add(page)

    return page
  }
}
