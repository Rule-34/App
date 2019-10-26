<template>
  <div class="card-container md:w-4/5"></div>
</template>

<script>
export default {
  name: "search-bar",
  // props: ["category"],
  data() {
    return this.$store.state.searchData;
  },
  methods: {
    getPosts: function() {
      this.$store.dispatch("axiosGet", {
        url: "posts",
        mutationToReturn: "newLatestPostsData"
      });
    }
  }
};
</script>

