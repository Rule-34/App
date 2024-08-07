<script lang="ts" setup>
  import { usePremiumDialog } from '~/composables/usePremiumDialog'
  import { useCycleList } from '@vueuse/core'
  import { premiumPromotions } from '~/assets/js/promotions'

  defineProps<{
    close: () => void
  }>()

  const { state, next, prev, go } = useCycleList(premiumPromotions)

  const { currentIndex } = usePremiumDialog()

  onMounted(() => {
    go(currentIndex.value)
  })
</script>

<template>
  <!-- Header -->
  <div>
    <div class="relative -mx-4 -mt-5">
      <NuxtLink
        :to="state.link"
        @click="close()"
      >
        <img
          :height="state.mediaHeight"
          :src="state.media"
          :width="state.mediaWidth"
          alt="Feature promotion"
          class="h-auto w-full"
        />
      </NuxtLink>

      <!-- Controls -->
      <div class="absolute bottom-[6%] left-4">
        <button
          class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util rounded-full bg-base-1000/80 px-2.5 py-1.5 font-semibold ring-1 ring-base-0/20"
          type="button"
          @click="prev()"
        >
          &larr;
        </button>
      </div>

      <div class="absolute bottom-[6%] right-4">
        <button
          class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util rounded-full bg-base-1000/80 px-2.5 py-1.5 font-semibold ring-1 ring-base-0/20"
          type="button"
          @click="next()"
        >
          &rarr;
        </button>
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="mt-6 space-y-2 sm:mt-6">
    <button
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-base-0/20"
      type="button"
      @click="close()"
    >
      Dismiss
    </button>
  </div>
</template>
