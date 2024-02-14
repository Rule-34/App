<script lang="ts" setup>
import {XMarkIcon} from '@heroicons/vue/20/solid'
import {useSessionStorage} from '@vueuse/core'

const showFeaturedDiscount = useSessionStorage('featuredDiscount', true, {
  writeDefaults: false
})

function closeBanner() {
  showFeaturedDiscount.value = false
}
</script>

<template>
  <div
    v-if="showFeaturedDiscount"
    class="relative rounded-lg p-4 ring-2 ring-base-0/20 max-w-sm mx-auto"
  >
    <button
      aria-label="Close banner"
      class="hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util hover:hover-text-util absolute -right-4 -top-4 rounded-full  p-1.5 text-2xl font-bold ring-2 ring-inset ring-base-0/20 backdrop-blur sm:text-sm"
      type="button"
      @click="closeBanner"
    >
      <span class="sr-only">Close</span>
      <XMarkIcon class="h-6 w-6"/>
    </button>

    <h2 class="text-xl font-bold text-base-content-highlight tracking-normal leading-8">Alone in Valentine's Day?</h2>

    <p class=''>
      The Rule 34 App has your back!
      <br>
      Get a discount and enjoy the day with your favorite characters, without ads
    </p>

    <p class='text-xs mt-2'>
      Only available until February 16th

    </p>

    <NuxtLink
      class="hover:hover-text-util hover:hover-bg-util focus-visible:focus-outline-util bg-util mt-4 block w-full rounded-lg tracking-tight p-2 text-center font-bold text-base-content-highlight ring-2 ring-base-0/20"
      target="_blank"
      to="https://alejandroakbal.gumroad.com/l/Rule34App/LONELY_VALENTINES"
    >
      Get 20% Off
    </NuxtLink>
  </div>
</template>
