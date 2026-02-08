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

    const stop = watch(
      hasInteracted,
      (hasInteracted) => {
        if (hasInteracted) {
          void init()
          stop()
        }
      },
      { flush: 'post', immediate: true }
    )

    async function init() {
      if (initPromise) return initPromise

      initPromise = (async () => {
        const Sentry = await import('@sentry/nuxt')
        const { isNuxtError } = await import('nuxt/app')
        // Risky on purpose: reuse the `@sentry/nuxt/module` internal helper for Nuxt/Vue error reporting.
        // This is a deep import and may break on Sentry upgrades or due to package "exports" restrictions.
        const { reportNuxtError } = await import('../node_modules/@sentry/nuxt/build/module/runtime/utils.js')

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
            if (error.status >= 300 && error.status < 500) {
              return
            }
          }

          reportNuxtError({ error })
        })

        nuxtApp.hook('vue:error', (error, instance, info) => {
          reportNuxtError({ error, instance, info })
        })
      })()

      return initPromise
    }
  }
})
