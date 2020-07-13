<template>
  <form class="fixed z-40 w-full min-h-screen bg-black bg-opacity-25">
    <div class="w-full h-screen search-grid">
      <!-- Separator -->
      <div @click.self="setSearchActive(false)" />

      <SearchBar />

      <SearchResults />

      <div @click.self="setSearchActive(false)" />
    </div>
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
    ...mapMutations('navigation', ['setSearchActive']),
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
