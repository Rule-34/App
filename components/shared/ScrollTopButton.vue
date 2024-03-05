<script setup>
  import { useScroll } from '@vueuse/core'
  import { ArrowUpIcon } from '@heroicons/vue/24/solid'

  const showScrollTopButton = ref(false)

  if (process.client) {
    const { y, directions } = useScroll(window, {
      onScroll: () => {
        if (
          //
          directions.top === true &&
          y.value >= window.innerHeight
        ) {
          showScrollTopButton.value = true

          //
        } else {
          showScrollTopButton.value = false
        }
      }
    })
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0
    })
  }
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <button
        v-show="showScrollTopButton"
        class="hover:hover-text-util hover:hover-bg-util fixed bottom-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-base-1000/60 text-base-content-highlight ring-2 ring-base-0/20 backdrop-blur-lg backdrop-saturate-200"
        type="button"
        @click="scrollToTop"
      >
        <span class="sr-only"> Scroll to top </span>

        <ArrowUpIcon class="h-6 w-6" />
      </button>
    </transition>
  </Teleport>
</template>
