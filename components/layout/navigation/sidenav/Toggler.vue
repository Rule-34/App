<template>
  <!-- Side Nav Toggler -->
  <aside class="fixed z-50 navigation-toggler">
    <div class="flex flex-col items-center justify-center">
      <button
        class="flex items-center justify-center w-12 h-12 p-4 border-0 border-transparent rounded-full shadow-lg md:w-16 md:h-16 bg-gradient-lilac-blue"
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
        class="flex items-center justify-center w-10 h-10 p-2 border-0 rounded-full shadow-lg md:w-12 md:h-12 bg-gradient-lilac-blue"
        title="Search"
        aria-label="Toggle the search menu"
        @click="toggleSearch"
      >
        <!-- Search Icon -->
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-default"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'NavToggler',

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
