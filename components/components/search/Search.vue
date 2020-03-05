<template>
  <div class="fixed min-h-screen w-full z-40 bg-black-25">
    <!-- Centered container -->
    <div class="flex flex-wrap md:flex-no-wrap h-screen">
      <!-- Separator -->
      <div
        class="hidden md:block md:w-2/12"
        @click.self="
          searchManager({
            mode: 'toggleSearch'
          })
        "
      />

      <!-- Search  -->
      <SearchBar class="w-full md:w-4/12 m-auto" />

      <!-- Search results -->
      <SearchResults
        class="flex flex-col p-2 my-auto w-full md:w-6/12 min-h-1/2 overflow-y-auto"
      />

      <div
        class="hidden md:block md:w-2/12"
        @click.self="
          searchManager({
            mode: 'toggleSearch'
          })
        "
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
    SearchResults
  },
  // Get data() from vuex store "searchData"
  computed: {
    ...mapState(['searchData'])
  },
  methods: {
    ...mapMutations(['searchManager'])
  }
}
</script>
