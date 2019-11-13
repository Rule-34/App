<template>
  <div class="search-bar" :class="{ active: searchData.isActive }">
    <!-- Centered container -->
    <div class="flex flex-wrap md:flex-no-wrap h-screen">
      <!-- Separator -->
      <div
        class="hidden md:block w-1/6"
        @click.self="toggleSearchComponent()"
      />
      <!-- Search bar -->
      <div class="w-full md:w-2/6 m-auto">
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
          <button></button>
          <div title="Filter out" @click="toggleFilter()">
            <FilterIcon
              class="icon w-6 h-6 mr-1"
              :class="{ 'text-red-400': isFilterActive }"
            />
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="search-bar-results w-full md:w-2/6 min-h-1/2 overflow-y-auto">
        <!-- ERROR HANDLING AND SEARCH RESULTS -->

        <!-- If theres errors -->
        <Errors />

        <!-- If nothing searched -->
        <h1
          v-if="!searchData.data && !generalData.errors"
          class="text-center font-hairline m-auto text-xl"
        >
          Search something!
        </h1>

        <!-- Added tags, click them to remove them -->
        <div
          v-if="searchData.tags"
          class="tag-container border-b rounded-b mb-2"
        >
          <a
            v-for="tag in searchData.tags"
            :key="tag"
            class="tag group"
            @click="
              newSearchData({
                tag: {
                  name: tag,
                  function: 'remove'
                }
              })
            "
            v-text="tag"
          />
        </div>

        <!-- Tags, click them to add them -->
        <div v-if="searchData.data" class="tag-container">
          <!-- Add tag to array of added tags, if filter is active then append '-' -->
          <a
            v-for="tag in searchData.data"
            :key="tag.name"
            class="tag group"
            @click="
              if (isFilterActive) {
                newSearchData({
                  tag: {
                    name: '-' + tag.name,
                    function: 'add'
                  }
                });
              } else {
                newSearchData({
                  tag: {
                    name: tag.name,
                    function: 'add'
                  }
                });
              }
            "
          >
            {{ tag.name }}
            <span
              class="text-gray-400 group-hover:text-gray-600"
              v-text="'(' + tag.posts + ')'"
            />
          </a>
        </div>

        <!-- Apply tags -->
        <a
          href="#"
          class="btn text-white text-center bg-gradient-lilac-blue mt-auto shadow-md"
          @click="dispatchGetAddedTags"
        >
          Apply tags
        </a>
      </div>

      <div
        class="hidden md:block w-1/6"
        @click.self="toggleSearchComponent()"
      />
      <!--  -->
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
import Errors from "./Errors.vue";
import FilterIcon from "vue-feather-icons";
import SearchIcon from "vue-feather-icons";
import debounce from "lodash/debounce";
import fireAnalytics from "~/assets/js/insights.custom"; //Import analytics

export default {
  name: "SearchBar",
  components: { Errors, SearchIcon, FilterIcon },
  data() {
    return {
      // Content from the search input
      searchQuery: "",
      isFilterActive: false
    };
  },
  // Get data() from vuex store "searchData"
  computed: {
    ...mapState(["dashBoardData", "searchData", "generalData"])
  },
  methods: {
    ...mapMutations(["newSearchData"]),
    ...mapActions([
      "toggleSearchComponent",
      "pidManager",
      "tagManager",
      "getPosts",
      "axiosGet"
    ]),
    toggleFilter() {
      // console.log("hola");
      this.isFilterActive = !this.isFilterActive;
    },
    dispatchGetAddedTags() {
      // Set PID to 0 since we're searching for new tags
      this.pidManager({
        function: "reset"
      });

      // Search for the tags
      this.getPosts();

      // Hide the search bar
      this.toggleSearchComponent();

      // And fire analytics
      fireAnalytics("tags", this.searchData.tags);
      // .then(console.log);
    },
    getTags() {
      if (this.searchQuery.length > 2) {
        // console.log(`${this.dashBoardData.pid} GET`);
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
    }, 300)
  }
};
</script>
