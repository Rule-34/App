import { defineConfig } from 'vitest/config'

// Disable Sentry source map uploads during tests — they add ~15s to `setup()`.
// The auth token env var propagates to the Nuxt dev server child process.
process.env.SENTRY_AUTH_TOKEN = ''
process.env.SENTRY_ORG = ''
process.env.SENTRY_PROJECT = ''

// Skip auth middleware for premium page tests (must be VITE_ prefixed to
// be available in Nuxt's Vite SSR context via import.meta.env)
process.env.VITE_TEST_AUTH_BYPASS = 'true'

export default defineConfig({
  test: {
    testTimeout: 15000
  }
})
