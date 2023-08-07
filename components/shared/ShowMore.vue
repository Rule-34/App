<script lang="ts" setup>
  import { useToggle } from '@vueuse/core'

  const props = defineProps<{
    maxHeightInRem: number
  }>()

  const [isExpanded, toggleExpanded] = useToggle()

  const contentRef = ref<HTMLElement | null>(null)

  function convertRemToPixels(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
  }

  const isContentTallerThanMaxHeight = computed(() => {
    if (!contentRef.value) {
      return false
    }

    return contentRef.value.scrollHeight > convertRemToPixels(props.maxHeightInRem)
  })

  const shouldBeExpanded = computed(() => {
    return isContentTallerThanMaxHeight.value && !isExpanded.value
  })
</script>

<template>
  <div>
    <!--  TODO: Animate max height -->
    <div
      ref="contentRef"
      :style="{ maxHeight: shouldBeExpanded ? `${props.maxHeightInRem}rem` : 'none' }"
      class="relative overflow-y-hidden"
    >
      <!-- Content -->
      <slot />

      <!-- Overlay-->
      <!--  TODO: Fix problem with overflow, as it doesnt take full width -->
      <div
        v-if="shouldBeExpanded"
        class="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-base-1000 via-transparent"
      />
    </div>

    <!-- Show more/less button -->
    <!--  TODO: Remove sm:mr when problem with overflow is fixed -->
    <div
      v-if="isContentTallerThanMaxHeight"
      class="flex justify-center bg-base-1000 pt-4 sm:mr-3.5"
    >
      <button
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util rounded-md bg-base-1000/60 px-2 py-1 text-sm ring-1 ring-base-0/20"
        type="button"
        @click="toggleExpanded()"
      >
        {{ isExpanded ? 'Show less' : 'Show more' }}
      </button>
    </div>
  </div>
</template>
