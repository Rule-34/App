import { watch } from 'vue'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useInteractionDetector } from '~/composables/useInteractionDetector'
import { buildSentryClientInitOptions } from '~/sentry.client.options'

/**
 * NOTE: This plugin intentionally mirrors the `@sentry/nuxt/module` client runtime plugin behavior,
 * but defers loading any Sentry code until the user interacts.
 *
 * Upstream reference (Sentry v10.32.1):
 * - `node_modules/@sentry/nuxt/build/module/runtime/plugins/sentry.client.js`
 *   - hooks: `app:error` (with 3xx/4xx Nuxt error filtering) and `vue:error`
 *
 * Keep this in sync with upstream behavior when upgrading Sentry.
 */
export default defineNuxtPlugin({
  parallel: true,
  setup(nuxtApp) {
    const config = useRuntimeConfig()
    const dsn = config.public.sentryDsn

    if (!dsn) return

    const { hasInteracted } = useInteractionDetector()

    let initPromise: Promise<void> | null = null

    const init = () => {
      if (initPromise) return initPromise

      initPromise = (async () => {
        const Sentry = await import('@sentry/nuxt')
        const { isNuxtError } = await import('nuxt/app')

        Sentry.init(
          buildSentryClientInitOptions({
            dsn,
            Sentry
          })
        )

        // Capture Nuxt-level errors (after init)
        nuxtApp.hook('app:error', (error) => {
          if (isNuxtError(error)) {
            if (error.statusCode >= 300 && error.statusCode < 500) {
              return
            }
          }

          Sentry.captureException(error)
        })

        nuxtApp.hook('vue:error', (error) => {
          Sentry.captureException(error)
        })
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
