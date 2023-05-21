<script setup>
  import { vIntersectionObserver } from '@vueuse/components'

  const emit = defineEmits(['loadNextPage'])

  function onIntersectionObserver([{ isIntersecting }]) {
    if (!isIntersecting) {
      return
    }

    emit('loadNextPage')
  }
</script>

<template>
  <div
    v-intersection-observer="[onIntersectionObserver, { rootMargin: '650px' }]"
    class="flex animate-pulse items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-base-content ring-1 ring-base-0/20"
  >
    Loading next page&hellip;
  </div>
</template>
