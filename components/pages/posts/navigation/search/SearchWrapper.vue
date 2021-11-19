<!--
This wrapper makes the inner component NOT render when NOT active.
Resetting the component state. Solving some issues.
-->

<template>
  <transition name="search">
    <slot v-if="isSearchActive" />
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('navigation', ['isSearchActive']),
  },
}
</script>

<style lang="postcss">
/*
* Search Transition
*/

/* Initial state */
.search-enter,
.search-leave-to {
  transform: translateX(100vw);
}

/* Toggled stated */
.search-enter-to {
  transform: translateX(0px);
}

/* Transition that is gonna be applied */
.search-enter-active,
.search-leave-active {
  @apply transition-transform duration-300;
}
</style>
