<template>
  <div
    class="search-bar fixed min-h-screen w-full z-10 right-minus-100 bg-transparent"
    :class="{active: searchData.isActive}"
  >
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
      <div class="post-container max-h-3/4 min-h-1/2 w-full md:w-2/6 flex flex-col p-2 my-auto">
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
        <div class="tag-container border-b rounded-b mb-2" v-if="addedTags">
          <a
            class="tag group"
            v-for="tag in addedTags"
            :key="tag"
            v-text="tag"
            @click="removeAddedTag(tag)"
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
          @click="getAddedTags"
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
      searchQuery: "",
      addedTags: []
    };
  },
  // Get data() from vuex store "searchData"
  computed: {
    tagUrl() {
      return;
    },
    // mix this into the outer object with the object spread operator
    ...mapState(["dashBoardData", "searchData", "generalData"])
  },
  methods: {
    toggleSearch: function() {
      this.$store.dispatch("toggleSearchComponent");
    },
    addTag: function(tagName) {
      // console.log(tagName);
      this.addedTags.push(tagName);
    },
    removeAddedTag: function(tag) {
      this.addedTags = this.addedTags.filter(function(ele) {
        return ele != tag;
      });
    },
    getAddedTags: function() {
      this.$store.dispatch("axiosGet", {
        url: `posts?pid=${this.dashBoardData.pid}&limit=${
          this.generalData.postLimit
        }&tags=${this.addedTags.join("+")}`,
        mutationToReturn: "newDashBoardData"
      });
      this.toggleSearch();
    },
    getTags() {
      if (this.searchQuery.length >= 3) {
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