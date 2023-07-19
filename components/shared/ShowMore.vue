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
  <!--  TODO: Animate max height -->
  <div
    :style="{ maxHeight: shouldBeExpanded ? `${props.maxHeightInRem}rem` : 'none' }"
    class="relative overflow-y-hidden"
  >
    <!-- Overlay-->
    <div
      v-if="shouldBeExpanded"
      class="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-base-1000 via-transparent"
    />

    <!-- Content -->
    <div ref="contentRef">
      <slot />
    </div>
  </div>

  <!-- Show more/less button -->
  <div
    v-if="isContentTallerThanMaxHeight"
    class="flex justify-center pt-4"
  >
    <button
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util rounded-md bg-base-1000/60 px-2 py-1 text-sm ring-1 ring-base-0/20"
      type="button"
      @click="toggleExpanded()"
    >
      {{ isExpanded ? 'Show less' : 'Show more' }}
    </button>
  </div>
</template>
