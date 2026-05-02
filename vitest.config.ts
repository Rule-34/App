import { defineConfig } from 'vitest/config'

// Disable Sentry source map uploads during tests — they add ~15s to `setup()`.
// The auth token env var propagates to the Nuxt dev server child process.
process.env.SENTRY_AUTH_TOKEN = ''
process.env.SENTRY_ORG = ''
process.env.SENTRY_PROJECT = ''

export default defineConfig({
  test: {
    testTimeout: 15000
  }
})
