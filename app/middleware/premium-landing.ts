import {
  activatePremiumLandingExperiment,
  isPremiumLandingPath,
  markPremiumLandingWrite,
  premiumLandingTargetFromRoute
} from '~/assets/js/matomo'

let premiumLandingNavigation = 0

/**
 * On a client navigation to the premium landing, assign the variation before the page
 * renders. The destination route is the target: window.location is still the page we
 * left. Full page loads keep the prerendered original markup visible and apply the
 * variation after mount.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server || !isPremiumLandingPath(to.path)) {
    return
  }

  if (from.matched.length === 0 || useNuxtApp().isHydrating) {
    return
  }

  const navigation = ++premiumLandingNavigation
  const { premiumLandingVariation } = useExperiments()
  const variation = await activatePremiumLandingExperiment(premiumLandingTargetFromRoute(to))

  if (navigation !== premiumLandingNavigation) {
    return
  }

  markPremiumLandingWrite()
  premiumLandingVariation.value = variation
})
