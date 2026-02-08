import { defineNuxtPlugin } from '#imports'

type MatomoQueueItem = [string, ...unknown[]]
type MatomoQueue = MatomoQueueItem[]
type MatomoWindow = Window & { _paq?: MatomoQueue }

/**
 * Track page view using Matomo
 * For the Script,
 * @see nuxt.config.js
 *
 * @see https://developer.matomo.org/guides/spa-tracking#solution-2-embedding-the-tracking-code-manually
 */
export default defineNuxtPlugin({
  parallel: true,
  setup() {
    const router = useRouter()

    let hasLoaded = false

    router.afterEach((to, from) => {
      onNuxtReady(async () => {
        const _paq = (window as MatomoWindow)._paq

        if (!_paq) {
          return
        }

        _paq.push(['setCustomUrl', to.fullPath])
        _paq.push(['setDocumentTitle', document.title])

        loadAbTesting(_paq)

        _paq.push(['trackPageView'])
        _paq.push(['enableLinkTracking'])
      })
    })

    const { hasInteracted } = useInteractionDetector()

    const stop = watch(
      hasInteracted,
      (val) => {
        if (val) {
          ensureMatomoLoaded()
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

      const script = document.createElement('script')
      script.src = matomoUrl + 'matomo.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }
})

let hasAbTestingLoaded = false

function loadAbTesting(_paq: MatomoQueue) {
  if (hasAbTestingLoaded) {
    return
  }

  // const { } = useExperiments()
  //
  // _paq.push([
  //   'AbTesting::create',
  //   {
  //     name: 'PriceCurrencyV2',
  //     percentage: 100,
  //     includedTargets: [{ attribute: 'path', inverted: '0', type: 'equals_simple', value: '/premium' }],
  //     excludedTargets: [],
  //     variations: [
  //       {
  //         name: 'original',
  //         activate: function (event) {
  //           // usually nothing needs to be done here
  //         }
  //       },
  //       {
  //         name: 'euro',
  //         activate: function (event) {
  //           experimentPriceCurrency.value = '€'
  //         }
  //       }
  //     ]
  //   }
  // ])

  hasAbTestingLoaded = true
}
