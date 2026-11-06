import {
  activatePremiumLandingExperiment,
  isPremiumLandingPath,
  premiumLandingVariationFromSearch
} from '~/assets/js/matomo'

/**
 * On a client navigation to the premium landing, assign the Matomo variation before the
 * page renders. Full page loads stay on the prerendered original markup until mount so
 * hydration matches; that markup is hidden until assignment finishes.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server || !isPremiumLandingPath(to.path)) {
    return
  }

  // The first load hydrates the prerendered original markup. Assign after mount instead.
  if (from.matched.length === 0 || useNuxtApp().isHydrating) {
    return
  }

  const { premiumLandingVariation } = useExperiments()
  const search = to.fullPath.includes('?') ? to.fullPath.slice(to.fullPath.indexOf('?')) : ''
  const queried = premiumLandingVariationFromSearch(search)

  if (queried) {
    premiumLandingVariation.value = queried
    void activatePremiumLandingExperiment()
    return
  }

  premiumLandingVariation.value = await activatePremiumLandingExperiment()
})
