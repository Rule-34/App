<template>
  <div class="search-bar" :class="{ active: searchData.isActive }">
    <!-- Centered container -->
    <div class="flex flex-wrap md:flex-no-wrap h-screen">
      <!-- Separator -->
      <div
        class="hidden md:block w-1/6"
        @click.self="
          newSearchData({
            isActive: !searchData.isActive
          })
        "
      />

      <!-- Search  -->
      <SearchBar class="w-full md:w-2/6 m-auto" />

      <!-- Search results -->
      <SearchResults
        class="search-bar-results w-full md:w-2/6 min-h-1/2 overflow-y-auto"
      />

      <div
        class="hidden md:block w-1/6"
        @click.self="
          newSearchData({
            isActive: !searchData.isActive
          })
        "
      />
      <!--  -->
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import SearchBar from "./SearchBar.vue";
import SearchResults from "./SearchResults.vue";

export default {
  name: "Search",
  components: {
    SearchBar,
    SearchResults
  },
  // Get data() from vuex store "searchData"
  computed: {
    ...mapState(["searchData"])
  },
  methods: {
    ...mapMutations(["newSearchData"])
  }
};
</script>
