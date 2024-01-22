import * as Sentry from '@sentry/vue'

async function lazyLoadSentryIntegrations() {
  // don't load on server
  if (!process.client) return

  // const { Replay } = await import('@sentry/vue')
  // Sentry.addIntegration(
  //   new Replay({
  //     maskAllText: false,
  //     blockAllMedia: false
  //   })
  // )
}

function getSentryIntegrations() {
  // don't load on server
  if (!process.client) return []

  const router = useRouter()
  const browserTracing = new Sentry.BrowserTracing({
    routingInstrumentation: Sentry.vueRouterInstrumentation(router)
  })

  return [browserTracing]
}

export default defineNuxtPlugin({
  name: 'sentry',
  parallel: true,

  async setup(nuxtApp) {
    const vueApp = nuxtApp.vueApp

    const config = useRuntimeConfig()

    Sentry.init({
      app: vueApp,
      dsn: config.public.SENTRY_DSN,
      integrations: getSentryIntegrations(),

      // TODO: https://gitlab.com/glitchtip/glitchtip-backend/-/issues/206
      autoSessionTracking: false,

      tracesSampleRate: 1.0,

      replaysSessionSampleRate: 1.0,
      replaysOnErrorSampleRate: 1.0
    })

    // Lazy-load the replay integration to reduce bundle size
    lazyLoadSentryIntegrations()
  }
})
