<script lang="ts" setup>
  import { defineAsyncComponent } from 'vue'
  import PremiumLandingOriginal from '~/components/pages/premium/PremiumLandingOriginal.vue'
  import {
    activatePremiumLandingExperiment,
    commitPremiumLandingAssignment,
    MATOMO_AB_STORAGE_KEY,
    PREMIUM_LANDING_EXPERIMENT_NAME,
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
        innerHTML: `window.__premiumLandingSearch=location.search;(function(){var arm="";var q=/(?:^|[?&])pk_ab_test=([^&#]*)/.exec(location.search);if(q){arm=decodeURIComponent(q[1].replace(/\\+/g," ")).split(",")[0].trim()}else{try{var stored=JSON.parse(localStorage.getItem(${JSON.stringify(MATOMO_AB_STORAGE_KEY)})||"null");var entry=stored&&stored[${JSON.stringify(`variation:${PREMIUM_LANDING_EXPERIMENT_NAME}`)}];if(entry&&!(typeof entry.expire==="number"&&Date.now()>=entry.expire)){arm=typeof entry==="string"?entry:entry.value||""}}catch(e){}}if(String(arm).toLowerCase()!=="visualfirst")return;var src=${JSON.stringify(visualFirstLcpSrc)};var link=document.createElement("link");link.rel="preload";link.as="image";link.href=src;link.fetchPriority="high";document.head.appendChild(link);var img=document.createElement("img");img.id="vf-early";img.alt="";img.src=src;img.width=400;img.height=600;img.decoding="sync";img.setAttribute("fetchpriority","high");img.style.cssText="position:absolute;top:80px;left:16px;z-index:5;display:block;width:min(190px,50vw);height:auto;aspect-ratio:2/3;object-fit:cover";document.body.insertBefore(img,document.body.firstChild)})()`,
        tagPosition: 'bodyOpen',
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
        <div
          class="aspect-[2/3] w-full"
          data-vf-slot
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
