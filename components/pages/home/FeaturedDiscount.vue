<script lang="ts" setup>
  import { XMarkIcon } from '@heroicons/vue/20/solid'
  import { useSessionStorage, useTimeAgo } from '@vueuse/core'
  import { computed } from 'vue'

  const SALE_END_DATE = new Date('2024-12-02T23:59:59')
  const timeAgo = useTimeAgo(SALE_END_DATE)

  const isActive = computed(() => {
    return new Date() < SALE_END_DATE
  })

  const showFeaturedDiscount = useSessionStorage('featuredDiscount', true, {
    writeDefaults: false
  })

  const shouldShow = computed(() => showFeaturedDiscount.value && isActive.value)

  function closeBanner() {
    showFeaturedDiscount.value = false
  }
</script>

<template>
  <div
    v-if="shouldShow"
    class="relative mx-auto max-w-sm rounded-lg p-4 ring-2 ring-base-0/20"
  >
    <button
      aria-label="Close banner"
      class="hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util hover:hover-text-util absolute -right-4 -top-4 rounded-full p-1.5 text-2xl font-bold ring-2 ring-inset ring-base-0/20 backdrop-blur-sm sm:text-sm"
      type="button"
      @click="closeBanner"
    >
      <span class="sr-only">Close</span>
      <XMarkIcon class="h-6 w-6" />
    </button>

    <h2 class="text-xl font-bold leading-8 tracking-normal text-base-content-highlight">Black Friday Sale! 🎉</h2>

    <p class="text-pretty">
      <!-- Treat yourself this Black Friday!
      <br /> -->
      Get 30 days of Premium features for <b>HALF THE PRICE</b> with code "BLACKFRIDAY" 💰
    </p>

    <p class="mt-2 text-xs">Offer ends {{ timeAgo }}</p>

    <NuxtLink
      class="hover:hover-text-util hover:hover-bg-util focus-visible:focus-outline-util bg-util mt-4 block w-full text-pretty rounded-lg p-2 text-center font-bold tracking-tight text-base-content-highlight ring-2 ring-base-0/20"
      rel="nofollow noopener noreferrer"
      to="/premium#pricing"
    >
      Use BLACKFRIDAY for 50% off
    </NuxtLink>
  </div>
</template>
