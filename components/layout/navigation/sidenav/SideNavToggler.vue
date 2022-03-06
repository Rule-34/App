<template>
  <button
    aria-label="Toggle the menu"
    class="
      flex
      items-center
      justify-center
      w-12
      h-12
      p-4
      border-0
      rounded-full
      md:w-16 md:h-16
      bg-gradient-to-b
      from-primary-400
      to-accent-400
      focus:focus-util
      shadow
    "
    title="Menu"
    type="menu"
    @click="toggleSideNav"
  >
    &nbsp;
  </button>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('navigation', ['sideNavNavigationManager']),

    toggleSideNav() {
      this.sideNavNavigationManager({ operation: 'toggle' })
    },
  },
}
</script>
