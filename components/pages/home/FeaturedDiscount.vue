<script lang="ts" setup>
  import { XMarkIcon } from '@heroicons/vue/20/solid'
  import { useSessionStorage } from '@vueuse/core'

  const showFeaturedDiscount = useSessionStorage('featuredDiscount', true, {
    writeDefaults: false
  })

  function closeBanner() {
    showFeaturedDiscount.value = false
  }
</script>

<template>
  <section
    v-if="showFeaturedDiscount"
    class="relative m-2 rounded-lg p-4 ring-2 ring-base-0/20"
  >
    <button
      aria-label="Close banner"
      class="hover:hover-bg-util hover:hover-text-util absolute -right-4 -top-6 rounded-full bg-base-0/20 p-2 text-2xl font-bold text-base-content-highlight ring-2 ring-inset ring-base-0/20 backdrop-blur sm:text-sm"
      type="button"
      @click="closeBanner"
    >
      <span class="sr-only">Close</span>
      <XMarkIcon class="h-6 w-6" />
    </button>

    <h2 class="text-2xl font-bold text-base-content-highlight">Alone in Valentine's Day?</h2>

    <p class="mt-2">
      Enjoy a
      <span class="underline"> 20% discount </span>
      on Premium and have fun browsing additional Boorus without ads
    </p>

    Only for a limited time!

    <NuxtLink
      class="hover:hover-text-util bg-util mt-4 block w-full rounded-lg p-2 text-center font-bold text-base-content-highlight ring-2 ring-base-0/20"
      to="https://alejandroakbal.gumroad.com/l/Rule34App/LONELY_VALENTINES"
    >
      Get 20% Off
    </NuxtLink>
  </section>
</template>
