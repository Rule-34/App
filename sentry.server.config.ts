import * as Sentry from '@sentry/nuxt'

// `useRuntimeConfig()` is not available here (this file must run before Nuxt boots).
const dsn = process.env.SENTRY_DSN || process.env.NUXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    enabled: process.env.NODE_ENV === 'production',
    dsn,
    tracesSampleRate: 0.2
  })
}
