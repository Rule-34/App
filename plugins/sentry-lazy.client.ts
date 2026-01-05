import { watch } from 'vue'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useInteractionDetector } from '~/composables/useInteractionDetector'
import { buildSentryClientInitOptions } from '~/sentry.client.options'

export default defineNuxtPlugin({
  parallel: true,
  setup(nuxtApp) {
    const config = useRuntimeConfig()
    const dsn = config.public.sentryDsn

    if (!dsn) return

    const { hasInteracted } = useInteractionDetector()

    let initPromise: Promise<void> | null = null
    const errorBuffer: unknown[] = []

    let unhookErrorBuffer: (() => void) | null = nuxtApp.hook('app:error', (err) => {
      errorBuffer.push(err)
    })

    const init = () => {
      if (initPromise) return initPromise

      initPromise = (async () => {
        const Sentry = await import('@sentry/nuxt')
        const SentryVue = await import('@sentry/vue')

        Sentry.init(
          buildSentryClientInitOptions({
            dsn,
            Sentry
          })
        )

        // Wire Vue integration (the @sentry/nuxt module normally does this in its client plugin).
        const client = Sentry.getClient()
        if (client) {
          client.addIntegration(
            SentryVue.vueIntegration({
              app: nuxtApp.vueApp,
              attachErrorHandler: true
            })
          )
        }

        // Capture Nuxt-level errors (after init). Swap in the real handler and flush any buffered errors.
        if (unhookErrorBuffer) {
          unhookErrorBuffer()
          unhookErrorBuffer = null
        }

        nuxtApp.hook('app:error', (err) => {
          Sentry.captureException(err)
        })

        for (const err of errorBuffer) {
          Sentry.captureException(err)
        }
        errorBuffer.length = 0
      })()

      return initPromise
    }

    if (hasInteracted.value) {
      void init()
      return
    }

    const stop = watch(
      hasInteracted,
      (val) => {
        if (val) {
          void init()
          stop()
        }
      },
      { flush: 'post', immediate: true }
    )
  }
})
