<template>
  <button
    aria-label="Toggle the search menu"
    class="
      flex
      items-center
      justify-center
      w-10
      h-10
      p-3
      border-0
      rounded-full
      md:w-12 md:h-12
      bg-gradient-to-t
      from-primary-400
      to-accent-400
      focus:focus-util
    "
    title="Search"
    type="menu"
    @click="toggleSearch"
  >
    <!-- Search Icon -->
    <SearchIcon class="icon" />
  </button>
</template>

<script>
import { SearchIcon } from 'vue-feather-icons'
import { mapActions } from 'vuex'

export default {
  name: 'SearchToggler',

  components: {
    SearchIcon,
  },

  methods: {
    ...mapActions('navigation', [
      'sideNavNavigationManager',
      'searchNavigationManager',
    ]),

    toggleSearch() {
      this.searchNavigationManager({ operation: 'toggle' })
    },
  },
}
</script>
