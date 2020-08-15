<template>
  <form class="p-4 md:p-0 md:gap-4 search-grid">
    <!-- Space for clicking out -->
    <div @click.self="setSearchIsActive(false)" />

    <SearchBar />

    <SearchResults />

    <!-- Space for clicking out -->
    <div @click.self="setSearchIsActive(false)" />
  </form>
</template>

<script>
import { mapMutations } from 'vuex'

// Components
import SearchBar from './SearchBar.vue'
import SearchResults from './SearchResults.vue'

export default {
  name: 'Search',

  components: {
    SearchBar,
    SearchResults,
  },

  methods: {
    ...mapMutations('navigation', ['setSearchIsActive']),
  },
}
</script>

<style lang="postcss" scoped>
.search-grid {
  display: grid;
  grid-template-rows: 0.5fr 1fr 3fr 0.5fr;
}

@screen md {
  .search-grid {
    grid-template-columns: 1fr 2fr 3fr 1fr;
    grid-template-rows: 1fr;
  }
}

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
