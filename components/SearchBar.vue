<template>
  <div class="search-bar" :class="{active: searchData.isActive}">
    <!-- Centered container -->
    <div class="flex flex-wrap md:flex-no-wrap h-screen">
      <!-- Separator -->
      <div class="hidden md:block w-1/6" @click.self="toggleSearch"></div>
      <!-- Search bar -->
      <div class="w-full md:w-2/6 m-auto">
        <div class="post-container p-2 inline-flex w-3/4">
          <!-- Search Icon -->
          <search-icon class="icon text-black w-6 h-6 mr-2"></search-icon>
          <!-- Input -->
          <input
            class="w-full ml-1 outline-none font-light"
            type="search"
            placeholder="Search: e.g. dragon"
            autofocus
            v-model="searchQuery"
            v-debounce:300ms="getTags"
          />
        </div>
      </div>

      <!-- Results -->
      <div class="search-bar-results w-full md:w-2/6 max-h-3/4 min-h-1/2">
        <!-- Show if theres nothing -->

        <!-- If theres errors -->
        <div class="text-center font-hairline m-auto text-xl" v-if="generalData.errors">
          <h1 v-text="generalData.errors"></h1>
          <a href="#" @click="getTags">Try again?</a>
        </div>

        <!-- If nothing searched -->
        <h1
          class="text-center font-hairline m-auto text-xl"
          v-if="!searchData.data && !generalData.errors"
        >Search something!</h1>

        <!-- Added tags -->
        <div class="tag-container border-b rounded-b mb-2" v-if="searchData.tags">
          <a
            class="tag group"
            v-for="tag in searchData.tags"
            :key="tag"
            v-text="tag"
            @click="removeTag(tag)"
          ></a>
        </div>

        <!-- Tags -->
        <div class="tag-container" v-if="searchData.data">
          <a
            class="tag group"
            v-for="tag in searchData.data"
            :key="tag.name"
            @click="addTag(tag.name)"
          >
            {{tag.name}}
            <span
              class="text-gray-400 group-hover:text-gray-600"
              v-text="'(' + tag.posts + ')'"
            ></span>
          </a>
        </div>

        <!-- Apply tags -->
        <button
          class="btn text-white bg-gradient-lilac-blue mt-auto shadow-md"
          @click="dispatchGetAddedTags"
        >Apply tags</button>
      </div>

      <div class="hidden md:block w-1/6" @click.self="toggleSearch"></div>
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
  computed: {
    // mix this into the outer object with the object spread operator
    ...mapState(["dashBoardData", "searchData", "generalData"])
  },
  methods: {
    toggleSearch: function() {
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
    dispatchGetAddedTags: function() {
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