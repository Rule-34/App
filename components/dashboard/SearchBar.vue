<template>
  <div>
    <!-- Search bar -->
    <div class="material-container p-2 w-3/4 flex justify-between">
      <!-- Search Icon -->
      <div class="w-full inline-flex">
        <SearchIcon class="icon text-black w-6 h-6 mr-2" />
        <!-- Input -->
        <input
          v-model="searchQuery"
          class="w-full ml-1 outline-none font-light"
          type="search"
          placeholder="Search: e.g. dragon"
          @input="debounceInput"
        />
      </div>

      <!-- Filter content -->
      <div
        title="Automatic filters"
        :class="{
          'text-orange-400': ContentMode.mode === 'furry'
        }"
        @click="toggleContentMode()"
      >
        <component :is="ContentMode.icon" class="icon w-6 h-6 mr-1" />
      </div>

      <!-- Filter content -->
      <div title="Filter content" @click="toggleFilter()">
        <FilterIcon
          class="icon w-6 h-6 mr-1"
          :class="{ 'text-red-400': searchData.isFilterActive }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
import {
  FilterIcon,
  SearchIcon,
  TrashIcon,
  GitlabIcon
} from "vue-feather-icons";
import debounce from "lodash/debounce";

export default {
  name: "Search",
  components: { SearchIcon, FilterIcon, TrashIcon, GitlabIcon },
  data() {
    return {
      // Content from the search input
      searchQuery: "",
      preMadeFilter: [],
      ContentMode: { mode: "reset", icon: "TrashIcon" }
    };
  },
  // Get data() from vuex store "searchData"
  computed: {
    ...mapState(["searchData", "generalData"])
  },
  methods: {
    ...mapMutations(["newSearchData"]),
    ...mapActions(["tagManager", "axiosGet"]),

    async toggleContentMode() {
      this.preMadeFilter = await this.$axios.$get(
        "https://gist.githubusercontent.com/VoidlessSeven7/c0b379d617b1d26c54158e90a1f096cd/raw/filter_anti_furry_r34.app.txt"
      );

      switch (this.ContentMode.mode) {
        case "reset":
          this.tagManager({ function: "reset" });
          this.ContentMode = { mode: "furry", icon: "GitlabIcon" };

          return true;

        case "furry":
          this.newSearchData({
            tag: {
              name: this.preMadeFilter,
              function: "concat"
            }
          });
          this.ContentMode = { mode: "reset", icon: "TrashIcon" };

          return true;
      }
    },
    getTags() {
      if (this.searchQuery.length > 2) {
        this.axiosGet({
          url: `tags?name=${this.searchQuery.trim().toLowerCase()}*&limit=${
            this.generalData.postLimit
          }&order_by=posts`,
          mutationToReturn: "newSearchData"
        });
      } else {
        // Remove search data cause search limit is 3 characters
        this.newSearchData({
          data: ""
        });
      }
    },
    debounceInput: debounce(function() {
      this.getTags();
      // console.log("hola");
    }, 300),
    toggleFilter() {
      this.newSearchData({
        isFilterActive: !this.searchData.isFilterActive
      });
    }
  }
};
</script>
