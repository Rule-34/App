<script setup>
  import { vIntersectionObserver } from '@vueuse/components'
  import { useThrottleFn } from '@vueuse/core'

  const emit = defineEmits(['loadNextPage'])

  function onIntersectionObserver([{ isIntersecting }]) {
    if (!isIntersecting) {
      return
    }

    emit('loadNextPage')
  }

  const throttledOnIntersectionObserver = useThrottleFn(onIntersectionObserver, 350)
</script>

<template>
  <div
    v-intersection-observer="[throttledOnIntersectionObserver, { rootMargin: '0px 0px 0px 0px', threshold: [1] }]"
    class="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-base-content"
    data-testid="load-next-page"
  >
    <slot />
  </div>
</template>
