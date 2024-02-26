import {defineNuxtPlugin} from '#imports'

/**
 * Track page view using Matomo
 * For the Script,
 * @see nuxt.config.js
 *
 * @see https://developer.matomo.org/guides/spa-tracking#solution-2-embedding-the-tracking-code-manually
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  router.afterEach((to, from) => {
    onNuxtReady(async () => {
      const _paq = window._paq

      if (!_paq) {
        return
      }

      _paq.push(['setCustomUrl', to.fullPath])
      _paq.push(['setDocumentTitle', document.title])

      loadAbTesting()

      _paq.push(['trackPageView'])
      _paq.push(['enableLinkTracking'])
    })
  })
})

let hasAbTestingLoaded = false

// TODO: A/B Test prices in USD
function loadAbTesting() {

  if (hasAbTestingLoaded) {
    return
  }

  const {experimentPrice} = useExperiments()

  _paq.push(['AbTesting::create', {
    name: 'PriceVariations', // you can also use '1' (ID of the experiment) to hide the name
    percentage: 100,
    includedTargets: [{'attribute': 'path', 'inverted': '0', 'type': 'equals_exactly', 'value': '\/premium'}],
    excludedTargets: [],
    variations: [
      {
        name: 'original',
        activate: function (event) {
          // usually nothing needs to be done here
        }
      },
      {
        name: 'p3_99', // you can also use '1' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 3.9
        }
      }, {
        name: 'p4', // you can also use '2' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 4
        }
      }, {
        name: 'p5', // you can also use '3' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 5
        }
      }, {
        name: 'p5_99', // you can also use '4' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 5.9
        }
      }, {
        name: 'p6', // you can also use '5' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 6
        }
      }, {
        name: 'p6_99', // you can also use '6' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 6.9
        }
      }, {
        name: 'p7', // you can also use '7' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 7
        }
      }, {
        name: 'p7_99', // you can also use '8' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 7.9
        }
      }, {
        name: 'p8', // you can also use '9' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 8
        }
      }, {
        name: 'p8_99', // you can also use '10' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 8.9
        }
      }, {
        name: 'p9', // you can also use '11' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 9
        }
      }, {
        name: 'p9_99', // you can also use '12' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 9.9
        }
      }, {
        name: 'p10', // you can also use '13' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 10
        }
      }, {
        name: 'p10_99', // you can also use '14' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 10.9
        }
      }, {
        name: 'p11', // you can also use '15' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 11
        }
      }, {
        name: 'p11_99', // you can also use '16' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 11.9
        }
      }, {
        name: 'p12', // you can also use '17' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 12
        }
      }, {
        name: 'p12_99', // you can also use '18' (ID of the variation) to hide the name
        activate: function (event) {
          experimentPrice.value = 12.9
        }
      }
    ],
    trigger: function () {
      return true // here you can further customize which of your visitors will participate in this experiment
    }
  }])

  hasAbTestingLoaded = true
}
