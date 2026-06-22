import { watch } from 'vue'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useInteractionDetector } from '~/composables/useInteractionDetector'
import { useIdleTask } from '~/composables/useIdleTask'

/**
 * NOTE: This plugin intentionally mirrors the `@sentry/nuxt/module` client runtime plugin behavior,
 * but defers loading any Sentry code until the user interacts.
 *
 * Upstream reference (Sentry v10.58.0):
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
    const { schedule } = useIdleTask()

    let initPromise: Promise<void> | null = null

    const stop = watch(
      hasInteracted,
      (hasInteracted) => {
        if (hasInteracted) {
          schedule(() => {
            void init()
          })
          stop()
        }
      },
      { flush: 'post', immediate: true }
    )

    async function init() {
      if (initPromise) return initPromise

      initPromise = (async () => {
        try {
          const [Sentry, { isNuxtError }, { reportNuxtError }, { buildSentryClientInitOptions }] = await Promise.all([
            import('@sentry/nuxt'),
            import('nuxt/app'),
            // Risky on purpose: reuse the `@sentry/nuxt/module` internal helper for Nuxt/Vue error reporting.
            // This is a deep import and may break on Sentry upgrades or due to package "exports" restrictions.
            import('../../node_modules/@sentry/nuxt/build/module/runtime/utils.js'),
            import('~~/sentry.client.options')
          ])

          Sentry.init(
            buildSentryClientInitOptions({
              dsn,
              Sentry
            })
          )

          // NOTE: We intentionally do NOT install `@sentry/vue`'s `vueIntegration` here.
          // With interaction-gated init, the Vue app is already mounted, and `@sentry/vue` will warn:
          // "Misconfigured SDK. Vue app is already mounted. Make sure to call `app.mount()` after `Sentry.init()`."
          // We rely on Nuxt hooks (`app:error` + `vue:error`) + `reportNuxtError` instead.

          // Capture Nuxt-level errors (after init)
          nuxtApp.hook('app:error', (error) => {
            if (isNuxtError(error)) {
              if (typeof error.status === 'number' && error.status >= 300 && error.status < 500) {
                return
              }
            }

            reportNuxtError({ error })
          })

          nuxtApp.hook('vue:error', (error, instance, info) => {
            reportNuxtError({ error, instance, info })
          })
        } catch (error) {
          console.error('Failed to initialize Sentry client', error)
        }
      })()

      return initPromise
    }
  }
})
