<script lang="ts" setup>
  import PremiumLandingOriginal from '~/components/pages/premium/PremiumLandingOriginal.vue'
  import PremiumOfferLanding from '~/components/pages/premium/PremiumOfferLanding.vue'
  import {
    activatePremiumLandingExperiment,
    premiumLandingVariationFromSearch,
    type PremiumLandingVariation
  } from '~/assets/js/matomo'

  const { premiumLandingVariation } = useExperiments()
  const nuxtApp = useNuxtApp()
  const hydrating = import.meta.server || nuxtApp.isHydrating
  const queriedVariation = import.meta.client ? premiumLandingVariationFromSearch(window.location.search) : null
  const pending = ref(true)

  definePageMeta({
    middleware: ['premium-landing']
  })

  useHead(() => ({
    htmlAttrs: {
      'data-premium-ab': pending.value ? 'pending' : undefined
    }
  }))

  function revealLanding() {
    pending.value = false

    if (import.meta.client) {
      document.documentElement.removeAttribute('data-premium-ab')
    }
  }

  async function showAssignedVariation(variation: PremiumLandingVariation) {
    const changed = variation !== premiumLandingVariation.value

    premiumLandingVariation.value = variation

    if (changed) {
      await nextTick()
    }

    revealLanding()
  }

  onMounted(async () => {
    if (!hydrating) {
      revealLanding()
      return
    }

    if (queriedVariation) {
      await showAssignedVariation(queriedVariation)
      void activatePremiumLandingExperiment()
      return
    }

    await showAssignedVariation(await activatePremiumLandingExperiment())
  })
</script>

<template>
  <div data-premium-landing>
    <PremiumLandingOriginal v-if="premiumLandingVariation === 'original'" />
    <PremiumOfferLanding
      v-else-if="premiumLandingVariation === 'OfferFirst'"
      variant="OfferFirst"
    />
    <PremiumOfferLanding
      v-else
      variant="VisualFirst"
    />
  </div>
</template>
