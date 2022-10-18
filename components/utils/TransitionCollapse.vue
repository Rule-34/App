<template>
  <transition
    name="collapse"
    @before-enter="beforeEnter"
    @enter="enter"
    @leave="leave"
  >
    <!-- Content -->
    <slot />
  </transition>
</template>

<script>
export default {
  methods: {
    beforeEnter(element) {
      requestAnimationFrame(() => {
        element.style.maxHeight = '0px'
        element.style.opacity = 0
      })
    },

    enter(element) {
      requestAnimationFrame(() => {
        element.style.maxHeight = `${element.scrollHeight}px`

        element.style.opacity = 1
      })
    },

    leave(element) {
      requestAnimationFrame(() => {
        element.style.maxHeight = '0px'
        element.style.opacity = 0
      })
    }
  }
}
</script>

<style lang="postcss">
/* Transition that is gonna be applied */
.collapse-enter-active,
.collapse-leave-active {
  transition-duration: 0.35s;
  transition-timing-function: ease;
  transition-property: opacity, max-height;
}
</style>
