<template>
  <div
    class="search-bar fixed min-h-screen w-full z-10 right-minus-100 bg-transparent"
    :class="{active: searchData.isActive}"
  >
    <!-- Centered container -->
    <div class="flex flex-wrap md:flex-no-wrap h-screen">
      <!-- Separator -->
      <div class="hidden md:block w-2/6" @click.self="toggleSearch"></div>
      <!-- Search bar -->
      <div class="w-full md:w-2/6 m-auto">
        <div class="post-container p-2 inline-flex w-3/4">
          <!-- Search Icon -->
          <search-icon class="pointer-events-none text-grey-darkest w-6 h-6 mr-2"></search-icon>
          <!-- Input -->
          <input
            class="w-full outline-none"
            type="search"
            placeholder="Search: e.g. dragons"
            autofocus
            v-model="searchQuery"
            v-debounce:300ms="getTags"
          />
        </div>
      </div>

      <!-- Results -->
      <div class="post-container w-full md:w-2/6 p-2 flex flex-col">
        <!-- Tags -->
        <div v-for="tag in searchData.data" :key="tag.name">
          <button v-text="tag.name"></button>
        </div>

        <!-- Apply tags -->
        <button class="btn text-white bg-gradient-lilac-blue mt-auto">Apply tags</button>
      </div>
      <!--  -->
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { SearchIcon } from "vue-feather-icons";

export default {
  name: "search-bar",
  components: { SearchIcon },
  data() {
    return {
      searchQuery: ""
    };
  },
  // Get data() from vuex store "searchData"
  computed: mapState(["searchData", "generalData"]),
  methods: {
    toggleSearch: function() {
      this.$store.dispatch("toggleSearchComponent");
    },
    getTags() {
      if (this.searchQuery.length >= 3) {
        // console.log(`${this.dashBoardData.pid} GET`);
        this.$store.dispatch("axiosGet", {
          url: `tags?name=${this.searchQuery}*&order_by=posts&limit=${this.generalData.limit}`,
          mutationToReturn: "newSearchData"
        });
      } else {
        this.$store.commit("newSearchData", {
          data: ""
        });
      }
    }
  }
};
</script>