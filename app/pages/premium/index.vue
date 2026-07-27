<script lang="ts" setup>
  const { premiumLandingVariation } = useExperiments()
</script>

<template>
  <LazyPremiumLandingOriginal v-if="premiumLandingVariation === 'original'" />
  <LazyPremiumOfferLanding
    v-else
    :variant="premiumLandingVariation"
  />
</template>
