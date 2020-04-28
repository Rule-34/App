<template>
  <form class="fixed min-h-screen w-full z-40 bg-black-25">
    <!-- Centered container -->
    <div class="h-screen w-full search-grid">
      <!-- Separator -->
      <div
        @click.self="
          searchManager({
            mode: 'toggleSearch',
          })
        "
      />

      <!-- Search  -->
      <SearchBar />

      <!-- Search results -->
      <SearchResults />

      <div
        @click.self="
          searchManager({
            mode: 'toggleSearch',
          })
        "
      />
    </div>
  </form>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import SearchBar from './SearchBar.vue'
import SearchResults from './SearchResults.vue'

export default {
  name: 'Search',
  components: {
    SearchBar,
    SearchResults,
  },
  // Get data() from vuex store "searchData"
  computed: {
    ...mapState(['searchData']),
  },
  methods: {
    ...mapMutations(['searchManager']),
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
