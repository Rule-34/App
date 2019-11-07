<template>
  <div class="search-bar" :class="{ active: searchData.isActive }">
    <!-- Centered container -->
    <div class="flex flex-wrap md:flex-no-wrap h-screen">
      <!-- Separator -->
      <div class="hidden md:block w-1/6" @click.self="toggleSearch" />
      <!-- Search bar -->
      <div class="w-full md:w-2/6 m-auto">
        <div class="post-container p-2 inline-flex w-3/4">
          <!-- Search Icon -->
          <SearchIcon class="icon text-black w-6 h-6 mr-2" />
          <!-- Input -->
          <input
            v-model="searchQuery"
            v-debounce:300ms="getTags"
            class="w-full ml-1 outline-none font-light"
            type="search"
            placeholder="Search: e.g. dragon"
            autofocus
          />
        </div>
      </div>

      <!-- Results -->
      <div class="search-bar-results w-full md:w-2/6 max-h-3/4 min-h-1/2">
        <!-- Show if theres nothing -->

        <!-- If theres errors -->
        <div
          v-if="generalData.errors !== null"
          class="text-center text-black font-hairline m-auto text-xl"
        >
          <h1 v-text="generalData.errors" />
          <a href="#" @click="getTags">Try again?</a>
        </div>

        <!-- If nothing searched -->
        <h1
          v-if="!searchData.data && !generalData.errors"
          class="text-center font-hairline m-auto text-xl"
        >
          Search something!
        </h1>

        <!-- Added tags -->
        <div
          v-if="searchData.tags"
          class="tag-container border-b rounded-b mb-2"
        >
          <a
            v-for="tag in searchData.tags"
            :key="tag"
            class="tag group"
            @click="removeTag(tag)"
            v-text="tag"
          />
        </div>

        <!-- Tags -->
        <div v-if="searchData.data" class="tag-container">
          <a
            v-for="tag in searchData.data"
            :key="tag.name"
            class="tag group"
            @click="addTag(tag.name)"
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

      <div class="hidden md:block w-1/6" @click.self="toggleSearch" />
      <!--  -->
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { SearchIcon } from "vue-feather-icons";

export default {
  name: "SearchBar",
  components: { SearchIcon },
  data() {
    return {
      searchQuery: ""
    };
  },
  // Get data() from vuex store "searchData"
  computed: {
    // mix this into the outer object with the object spread operator
    ...mapState(["dashBoardData", "searchData", "generalData"])
  },
  methods: {
    toggleSearch() {
      this.$store.dispatch("toggleSearchComponent");
    },
    addTag: function(tagName) {
      // console.log(tagName);
      this.$store.commit("newSearchData", {
        tag: {
          name: tagName,
          function: "add"
        }
      });
    },
    removeTag: function(tagName) {
      this.$store.commit("newSearchData", {
        tag: {
          name: tagName,
          function: "remove"
        }
      });
    },
    dispatchGetAddedTags() {
      // Set PID to 0 since we're searching for new tags
      this.$store.dispatch("changePID", {
        function: "reset"
      });

      // Search for the tags
      this.$store.dispatch("getAddedTags");

      // And hide the search bar
      this.toggleSearch();
    },
    getTags() {
      if (this.searchQuery.length > 2) {
        // console.log(`${this.dashBoardData.pid} GET`);
        this.$store.dispatch("axiosGet", {
          url: `tags?name=${this.searchQuery.trim().toLowerCase()}*&limit=${
            this.generalData.postLimit
          }&order_by=posts`,
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
