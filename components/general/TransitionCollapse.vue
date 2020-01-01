<template>
  <transition
    @before-enter="beforeEnter"
    @enter="enter"
    @leave="leave"
    enter-active-class="collapse-enter-active"
    leave-active-class="collapse-leave-active"
  >
    <!-- 

    @before-leave="beforeLeave"

    @after-leave="afterLeave"
    
    @after-enter="afterEnter"
    
      -->
    <slot />
  </transition>
</template>

<script>
export default {
  name: 'TransitionCollapse',
  methods: {
    beforeEnter(element) {
      requestAnimationFrame(() => {
        element.style.height = '0px'
        element.style.opacity = 0
      })
    },

    enter(element) {
      requestAnimationFrame(() => {
        element.style.height = `${element.scrollHeight}px`
        // console.log('Scroll', element.scrollHeight)

        element.style.opacity = 1
      })
    },

    // afterEnter(element) {
    //   element.style.height = null
    //   element.style.opacity = null
    // },

    // This would be the toggled state

    // beforeLeave(element) {
    //   requestAnimationFrame(() => {
    //     element.style.height = `${element.offsetHeight}px`
    //     // console.log('Offset', element.offsetHeight)

    //     element.style.opacity = 1
    //   })
    // },

    leave(element) {
      requestAnimationFrame(() => {
        element.style.height = '0px'
        element.style.opacity = 0
      })
    },

    // afterLeave(element) {
    //   element.style.height = null
    //   element.style.opacity = null
    // },
  },
}
</script>

<style lang="scss">
// Transition that is gonna be applied
.collapse-enter-active,
.collapse-leave-active {
  overflow: hidden;

  transition-duration: 0.35s;
  transition-timing-function: ease;
  transition-property: opacity, height;
}
</style>
