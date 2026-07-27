import { defineNuxtPlugin } from '#imports'
import { useIdleTask } from '~/composables/useIdleTask'
import type { PremiumLandingVariation } from '~/composables/useExperiments'

type MatomoQueueItem = [string, ...unknown[]]
type MatomoQueue = MatomoQueueItem[]
type MatomoWindow = Window & { _paq?: MatomoQueue }

/**
 * Track page view using Matomo
 * For the Script,
 * @see nuxt.config.ts
 *
 * @see https://developer.matomo.org/guides/spa-tracking#solution-2-embedding-the-tracking-code-manually
 */
export default defineNuxtPlugin({
  parallel: true,
  setup() {
    const router = useRouter()
    const { premiumLandingVariation } = useExperiments()

    let hasLoaded = false

    router.afterEach((to) => {
      // Keep this idle boundary: afterEach runs before Nuxt finishes updating document.title.
      onNuxtReady(() => {
        const _paq = (window as MatomoWindow)._paq

        if (!hasLoaded || !_paq || router.currentRoute.value.fullPath !== to.fullPath) {
          return
        }

        trackPageView(_paq, to.fullPath, premiumLandingVariation)
      })
    })

    const { hasInteracted } = useInteractionDetector()
    const { schedule } = useIdleTask()

    const stop = watch(
      hasInteracted,
      (val) => {
        if (val) {
          schedule(ensureMatomoLoaded)
          stop()
        }
      },
      { flush: 'post', immediate: true }
    )

    function ensureMatomoLoaded() {
      if (hasLoaded) {
        return
      }

      hasLoaded = true

      const _paq = ((window as MatomoWindow)._paq = (window as MatomoWindow)._paq || [])

      const matomoUrl = 'https://matomo.akbal.dev/'
      _paq.push(['setTrackerUrl', matomoUrl + 'matomo.php'])
      _paq.push(['setSiteId', '1'])
      _paq.push(['setDomains', ['*.r34.app']])

      _paq.push(['enableCrossDomainLinking'])
      _paq.push(['setExcludedQueryParams', ['page', 'cursor']])
      _paq.push(['enableLinkTracking'])

      trackPageView(_paq, router.currentRoute.value.fullPath, premiumLandingVariation)

      const script = document.createElement('script')
      script.src = matomoUrl + 'matomo.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }
})

function isPremiumLanding(path: string) {
  return /\/premium\/?$/.test(path)
}

function trackPageView(_paq: MatomoQueue, path: string, premiumLandingVariation: { value: PremiumLandingVariation }) {
  _paq.push(['setCustomUrl', path])
  _paq.push(['setDocumentTitle', document.title])

  loadAbTesting(_paq, premiumLandingVariation)

  _paq.push(['trackPageView'])
}

function loadAbTesting(_paq: MatomoQueue, premiumLandingVariation: { value: PremiumLandingVariation }) {
  _paq.push([
    'AbTesting::create',
    {
      name: 'PremiumLandingV1',
      percentage: 100,
      includedTargets: [{ attribute: 'url', inverted: '0', type: 'any', value: '' }],
      excludedTargets: [],
      trigger: () => isPremiumLanding(location.pathname),
      variations: [
        {
          name: 'original',
          activate: () => {
            premiumLandingVariation.value = 'original'
          }
        },
        {
          name: 'OfferFirst',
          activate: () => {
            premiumLandingVariation.value = 'OfferFirst'
          }
        },
        {
          name: 'YearlyFocus',
          activate: () => {
            premiumLandingVariation.value = 'YearlyFocus'
          }
        }
      ]
    }
  ])
}
