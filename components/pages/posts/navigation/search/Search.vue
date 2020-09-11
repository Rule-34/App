<template>
  <form class="p-4 md:p-0 md:gap-4 search-grid">
    <!-- Space for clicking out -->
    <div @click.self.stop="closeSearchMenu()" />

    <SearchBar />

    <SearchResults />

    <!-- Space for clicking out -->
    <div @click.self.stop="closeSearchMenu()" />
  </form>
</template>

<script>
import { mapActions } from 'vuex'

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
    ...mapActions('navigation', ['searchNavigationManager']),

    closeSearchMenu() {
      this.searchNavigationManager({ operation: 'set', value: false })
    },
  },
}
</script>

<style lang="postcss">
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
</style>
