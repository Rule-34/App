<script lang="ts" setup>
  import { defineAsyncComponent } from 'vue'
  import PremiumLandingOriginal from '~/components/pages/premium/PremiumLandingOriginal.vue'
  import {
    activatePremiumLandingExperiment,
    commitPremiumLandingAssignment,
    currentPremiumLandingWriteId,
    finishPremiumLandingHydration,
    isPremiumLandingHydrating,
    isPremiumLandingPath,
    premiumLandingTargetFromRoute,
    markPremiumLandingWrite,
    premiumLandingVariationFromSearch,
    readStorage,
    synchronousPremiumLandingVariation,
    type PremiumLandingTarget
  } from '~/assets/js/matomo'

  const PremiumOfferLanding = defineAsyncComponent(() => import('~/components/pages/premium/PremiumOfferLanding.vue'))

  const { premiumLandingVariation } = useExperiments()
  const visualFirstLcpSrc = '/img/featured/rule34.xxx/top-1.jpg'
  const visualHeroPreviews = [
    visualFirstLcpSrc,
    '/img/featured/rule34.xxx/top-2.jpg',
    '/img/featured/rule34.xxx/top-3.jpg',
    '/img/featured/rule34.xxx/top-4.jpg'
  ]

  definePageMeta({
    middleware: ['premium-landing']
  })

  if (import.meta.server) {
    const forced = premiumLandingVariationFromSearch(useRequestURL().search)
    if (forced) {
      premiumLandingVariation.value = forced
    }
  } else if (isPremiumLandingPath(window.location.pathname)) {
    const known = synchronousPremiumLandingVariation(
      { path: window.location.pathname, search: window.location.search },
      readStorage()
    )

    if (known === 'VisualFirst') {
      const image = new Image()
      image.src = visualFirstLcpSrc
    }
  }

  useHead({
    script: [
      {
        key: 'premium-landing-search',
        innerHTML: 'window.__premiumLandingSearch=location.search',
        tagPriority: 'critical'
      }
    ],
    link:
      import.meta.server && premiumLandingVariation.value === 'VisualFirst'
        ? [
            {
              rel: 'preload',
              as: 'image',
              href: visualFirstLcpSrc,
              fetchpriority: 'high',
              tagPriority: -100
            }
          ]
        : []
  })

  const route = useRoute()

  watch(
    () => route.fullPath,
    () => {
      if (import.meta.server || isPremiumLandingHydrating() || !isPremiumLandingPath(route.path)) {
        return
      }

      const target = premiumLandingTargetFromRoute(route)
      const writeId = currentPremiumLandingWriteId()

      void activatePremiumLandingExperiment(target).then((variation) => {
        if (currentPremiumLandingWriteId() !== writeId) {
          return
        }

        markPremiumLandingWrite()
        premiumLandingVariation.value = variation
      })
    }
  )

  let landingMounted = true
  const showRestOfHero = ref(false)

  onUnmounted(() => {
    landingMounted = false
  })

  onMounted(() => {
    showRestOfHero.value = true
    const target: PremiumLandingTarget = {
      path: window.location.pathname,
      search: window.location.search
    }
    const variationAtStart = premiumLandingVariation.value
    const writeId = currentPremiumLandingWriteId()
    const pendingAssignment = activatePremiumLandingExperiment(target)
    finishPremiumLandingHydration()

    void pendingAssignment.then((variation) => {
      if (currentPremiumLandingWriteId() !== writeId) {
        return
      }

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

      markPremiumLandingWrite()

      if (variation === 'VisualFirst') {
        const image = new Image()
        image.src = visualFirstLcpSrc
      }

      premiumLandingVariation.value = variation
    })
  })
</script>

<template>
  <div data-premium-landing>
    <section
      v-if="premiumLandingVariation === 'VisualFirst'"
      aria-hidden="true"
      class="relative mx-auto max-w-6xl px-4 pt-6 sm:px-6"
      data-testid="premium-visual-hero"
    >
      <div class="grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl sm:grid-cols-4 sm:gap-2">
        <img
          :src="visualFirstLcpSrc"
          alt=""
          class="aspect-[2/3] w-full object-cover"
          decoding="sync"
          fetchpriority="high"
          height="600"
          loading="eager"
          width="400"
        />
        <template
          v-for="src in visualHeroPreviews.slice(1)"
          :key="src"
        >
          <img
            v-if="showRestOfHero"
            :src="src"
            alt=""
            class="aspect-[2/3] w-full object-cover"
            decoding="async"
            fetchpriority="low"
            height="600"
            loading="lazy"
            width="400"
          />
          <div
            v-else
            class="aspect-[2/3] w-full"
          />
        </template>
      </div>
      <div
        class="pointer-events-none absolute inset-x-4 bottom-0 h-16 bg-linear-to-t from-black to-transparent sm:inset-x-6"
      />
    </section>
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
