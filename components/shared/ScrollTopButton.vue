<script setup>
  import { useScroll } from '@vueuse/core'
  import { ArrowUpIcon } from '@heroicons/vue/24/solid'

  let y = ref(0)

  if (process.client) {
    const { y: scrollY } = useScroll(document)

    y = scrollY
  }

  const shouldShowScrollTopButton = computed(() => y.value > 250)

  function scrollToTop() {
    window.scrollTo({
      top: 0
    })
  }
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <button
        v-if="shouldShowScrollTopButton"
        class="hover:hover-text-util hover:hover-bg-util fixed bottom-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-base-1000/60 text-base-content-highlight ring-2 ring-base-0/20 backdrop-blur"
        type="button"
        @click="scrollToTop"
      >
        <span class="sr-only"> Scroll to top </span>

        <ArrowUpIcon class="h-6 w-6" />
      </button>
    </transition>
  </Teleport>
</template>
