<template>
  <button
    aria-label="Toggle the menu"
    class="focus:focus-util flex h-12 w-12 items-center justify-center rounded-full border-0 bg-gradient-to-b from-primary-400 to-accent-400 p-4 shadow md:h-16 md:w-16"
    title="Menu"
    type="menu"
    @click="toggleSideNav"
  >
    <MenuIcon class="icon" />
  </button>
</template>

<script>
import { mapActions } from 'vuex'
import { MenuIcon } from 'vue-feather-icons'

export default {
  components: {
    MenuIcon
  },

  methods: {
    ...mapActions('navigation', ['sideNavNavigationManager']),

    toggleSideNav() {
      this.sideNavNavigationManager({ operation: 'toggle' })
    }
  }
}
</script>
