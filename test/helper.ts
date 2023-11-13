import type { TestOptions } from '@nuxt/test-utils'

/**
 * Use alongside page.pause() to debug tests
 */
export const debugBrowserOptions: TestOptions['browserOptions'] = {
  type: 'chromium',
  launch: {
    headless: false,
    slowMo: 1000,
    devtools: true
  }
}
