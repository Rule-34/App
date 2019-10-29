<template>
  <div class="search-bar" :class="{active: searchData.isActive}">
    <!-- Centered container -->
    <div class="flex flex-wrap md:flex-no-wrap h-screen bg-black-15">
      <!-- Separator -->
      <div class="hidden md:block w-2/6"></div>
      <!-- Search bar -->
      <div class="w-full md:w-2/6 m-auto">
        <div class="post-container p-2 inline-flex w-3/4">
          <!-- Search Icon -->
          <svg
            class="fill-current pointer-events-none text-grey-darkest w-6 h-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            >
            <path
              d="M337.509 305.372h-17.501l-6.571-5.486c20.791-25.232 33.922-57.054 33.922-93.257C347.358 127.632 283.896 64 205.135 64 127.452 64 64 127.632 64 206.629s63.452 142.628 142.225 142.628c35.011 0 67.831-13.167 92.991-34.008l6.561 5.487v17.551L415.18 448 448 415.086 337.509 305.372zm-131.284 0c-54.702 0-98.463-43.887-98.463-98.743 0-54.858 43.761-98.742 98.463-98.742 54.7 0 98.462 43.884 98.462 98.742 0 54.856-43.762 98.743-98.462 98.743z"
            />
          </svg>
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

export default {
  name: "search-bar",
  data() {
    return {
      searchQuery: ""
    };
  },
  // Get data() from vuex store "searchData"
  computed: mapState(["searchData", "generalData"]),
  methods: {
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