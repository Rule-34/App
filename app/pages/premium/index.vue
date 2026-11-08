<script lang="ts" setup>
  import { defineAsyncComponent } from 'vue'
  import PremiumLandingOriginal from '~/components/pages/premium/PremiumLandingOriginal.vue'
  import {
    activatePremiumLandingExperiment,
    commitPremiumLandingAssignment,
    type PremiumLandingTarget
  } from '~/assets/js/matomo'

  const PremiumOfferLanding = defineAsyncComponent(() => import('~/components/pages/premium/PremiumOfferLanding.vue'))

  const { premiumLandingVariation } = useExperiments()

  definePageMeta({
    middleware: ['premium-landing']
  })

  useHead({
    script: [
      {
        key: 'premium-landing-search',
        innerHTML: 'window.__premiumLandingSearch=location.search',
        tagPriority: 'critical'
      }
    ]
  })

  let landingMounted = true

  onUnmounted(() => {
    landingMounted = false
  })

  onMounted(() => {
    const target: PremiumLandingTarget = {
      path: window.location.pathname,
      search: window.location.search
    }
    const variationAtStart = premiumLandingVariation.value

    void activatePremiumLandingExperiment(target).then((variation) => {
      if (
        !commitPremiumLandingAssignment(
          landingMounted,
          premiumLandingVariation.value,
          variationAtStart,
          window.location,
          target
        )
      ) {
        return
      }

      premiumLandingVariation.value = variation
    })
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
