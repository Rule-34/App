<template>
  <div class="fixed min-h-screen w-full z-20 bg-black-25">
    <!-- Centered container -->
    <div class="flex flex-wrap md:flex-no-wrap h-screen">
      <!-- Separator -->
      <div
        @click.self="
          newSearchData({
            isActive: !searchData.isActive,
          })
        "
        class="hidden md:block w-1/6"
      />

      <!-- Search  -->
      <SearchBar class="w-full md:w-2/6 m-auto" />

      <!-- Search results -->
      <SearchResults class="flex flex-col p-2 my-auto w-full md:w-2/6 min-h-1/2 overflow-y-auto" />

      <div
        @click.self="
          newSearchData({
            isActive: !searchData.isActive,
          })
        "
        class="hidden md:block w-1/6"
      />
      <!--  -->
    </div>
  </div>
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
    ...mapMutations(['newSearchData']),
  },
}
</script>
