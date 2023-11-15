import type { TestOptions } from '@nuxt/test-utils'

export const defaultBrowserOptions: TestOptions['browserOptions'] = {
  type: 'chromium',
  launch: {
    headless: true
  }
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
