import { defineNuxtPlugin } from '#imports'
import { useIdleTask } from '~/composables/useIdleTask'
import {
  configureMatomo,
  ensureMatomoLoaded,
  isPremiumRoute,
  noteMatomoNavigation,
  trackMatomoPageView
} from '~/assets/js/matomo'

/**
 * Track page views with Matomo.
 * Every `/premium` route loads the tracker on page load so scroll-only visits are counted,
 * the landing experiment can assign a variation, and premium goals can be queued immediately.
 * Every other route keeps the interaction + idle boundary.
 *
 * @see https://developer.matomo.org/guides/spa-tracking#solution-2-embedding-the-tracking-code-manually
 * @see https://developer.matomo.org/guides/ab-tests/browser
 */
export default defineNuxtPlugin({
  parallel: true,
  setup() {
    const router = useRouter()
    let navigationId = 0

    configureMatomo({ enabled: useRuntimeConfig().public.matomoEnabled !== false })

    router.afterEach((to) => {
      const trackedNavigationId = ++navigationId
      noteMatomoNavigation(trackedNavigationId)

      // Keep this idle boundary: afterEach runs before Nuxt finishes updating document.title.
      onNuxtReady(() => {
        if (router.currentRoute.value.fullPath !== to.fullPath) {
          return
        }

        void trackMatomoPageView(`${window.location.pathname}${window.location.search}`, trackedNavigationId)
      })
    })

    if (isPremiumRoute(router.currentRoute.value.path)) {
      noteMatomoNavigation(navigationId)
      void ensureMatomoLoaded()

      onNuxtReady(() => {
        void trackMatomoPageView(`${window.location.pathname}${window.location.search}`, navigationId)
      })

      return
    }

    const { hasInteracted } = useInteractionDetector()
    const { schedule } = useIdleTask()

    const stop = watch(
      hasInteracted,
      (val) => {
        if (val) {
          schedule(() => {
            void trackMatomoPageView(`${window.location.pathname}${window.location.search}`, navigationId, {
              load: true
            })
          })
          stop()
        }
      },
      { flush: 'post', immediate: true }
    )
  }
})
