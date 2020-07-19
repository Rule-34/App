<template>
  <!-- Side Nav Toggler -->
  <div class="fixed z-50 navigation-toggler">
    <button
      class="block w-12 h-12 m-4 border-0 rounded-full shadow-lg select-none md:w-16 md:h-16 md:m-2 bg-gradient-lilac-blue"
      type="menu"
      title="Menu"
      @click="setSideNavActive(!sideNav.isActive)"
    >
      &nbsp;
    </button>
    <button
      v-if="showSearch"
      type="menu"
      class="block w-10 h-10 m-5 border-0 rounded-full shadow-lg select-none md:w-12 md:h-12 md:m-4 bg-gradient-lilac-blue"
      title="Search"
      @click="setSearchActive(!search.isActive)"
    >
      <!-- Search Icon -->
      <SearchIcon class="inline-flex w-6 h-6 icon text-default" />
    </button>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { SearchIcon } from 'vue-feather-icons'

export default {
  name: 'NavToggler',

  components: { SearchIcon },

  props: { showSearch: { type: Boolean, default: false, required: false } },

  computed: {
    ...mapState('navigation', ['sideNav', 'search']),
  },

  methods: {
    ...mapMutations('navigation', ['setSideNavActive', 'setSearchActive']),
  },
}
</script>

<style lang="postcss">
.navigation-toggler {
  top: 7vh;
  transform: translateX(-35px);
  @apply transition-transform duration-300;
}

.navigation-toggler:hover {
  transform: translateX(1vw);
}

/* Changes for medium screens */
@screen md {
  .navigation-toggler {
    transform: translateX(1vw);
  }
}
</style>
