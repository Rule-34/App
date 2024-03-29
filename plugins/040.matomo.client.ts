import { defineNuxtPlugin } from '#imports'

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

      loadAbTesting(_paq)

      _paq.push(['trackPageView'])
      _paq.push(['enableLinkTracking'])
    })
  })

  return {
    parallel: true,
  }
})

let hasAbTestingLoaded = false

function loadAbTesting(_paq) {

  if (hasAbTestingLoaded) {
    return
  }

  hasAbTestingLoaded = true
}
