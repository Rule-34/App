<script lang="ts" setup>
  import { useCycleList } from '@vueuse/core'
  import { premiumPromotions } from '~/assets/js/promotions'
  import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'

  defineProps<{
    close: () => void
  }>()

  const { state, next, prev, go } = useCycleList(premiumPromotions)
  const localePath = useLocalePath()

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
        :to="localePath(state.link)"
        @click="close()"
      >
        <NuxtPicture
          :alt="$t('common.featurePromotion')"
          :height="state.mediaHeight"
          :src="state.media"
          :width="state.mediaWidth"
          class="h-auto w-full"
        />
      </NuxtLink>

      <!-- Controls -->
      <div class="absolute bottom-[6%] left-4">
        <button
          :aria-label="$t('common.previous')"
          class="rounded-full bg-base-1000/80 p-2 font-semibold ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
          type="button"
          @click="prev()"
        >
          <ArrowLeftIcon
            aria-hidden="true"
            class="h-5 w-5"
          />
        </button>
      </div>

      <div class="absolute right-4 bottom-[6%]">
        <button
          :aria-label="$t('common.next')"
          class="rounded-full bg-base-1000/80 p-2 font-semibold ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
          type="button"
          @click="next()"
        >
          <ArrowRightIcon
            aria-hidden="true"
            class="h-5 w-5"
          />
        </button>
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="mt-6 space-y-2 sm:mt-6">
    <button
      class="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-base-0/20 ring-inset hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
      type="button"
      @click="close()"
    >
      {{ $t('common.close') }}
    </button>
  </div>
</template>
