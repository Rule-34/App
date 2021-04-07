<template>
  <!-- Side Nav Toggler -->
  <aside class="fixed z-50 navigation-toggler">
    <div class="flex flex-col items-center justify-center">
      <button
        class="flex items-center justify-center w-12 h-12 p-4 border-0 border-transparent rounded-full md:w-16 md:h-16 bg-gradient-to-b from-primary-400 to-accent-400 focus:focus-util"
        type="menu"
        title="Menu"
        aria-label="Toggle the Menu"
        @click="toggleSideNav"
      >
        &nbsp;
      </button>

      <div class="my-2"></div>

      <button
        v-show="showSearch"
        type="menu"
        class="flex items-center justify-center w-10 h-10 p-3 border-0 rounded-full md:w-12 md:h-12 bg-gradient-to-t from-primary-400 to-accent-400 focus:focus-util"
        title="Search"
        aria-label="Toggle the search menu"
        @click="toggleSearch"
      >
        <!-- Search Icon -->
        <SearchIcon class="icon" />
      </button>
    </div>
  </aside>
</template>

<script>
import { mapActions } from 'vuex'
import { SearchIcon } from 'vue-feather-icons'

export default {
  components: {
    SearchIcon,
  },

  props: { showSearch: { type: Boolean, default: false, required: false } },

  methods: {
    ...mapActions('navigation', [
      'sideNavNavigationManager',
      'searchNavigationManager',
    ]),

    toggleSideNav() {
      this.sideNavNavigationManager({ operation: 'toggle' })
    },

    toggleSearch() {
      this.searchNavigationManager({ operation: 'toggle' })
    },
  },
}
</script>

<style lang="postcss">
.navigation-toggler {
  @apply transition-transform duration-300;

  top: 7vh;
  transform: translateX(-50%);
}

.navigation-toggler:hover {
  transform: translateX(1vw);
}

@screen md {
  .navigation-toggler {
    transform: translateX(1vw);
  }
}
</style>
