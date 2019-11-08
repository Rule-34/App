<template>
  <!-- Width on medium screens -->
  <div class="card-container md:w-2/3 xl:w-1/2">
    <!-- If Axios request got errors -->
    <div
      v-if="generalData.errors !== null"
      class="post-container text-center p-2"
    >
      <h1 class="bold" v-text="generalData.errors" />
      <a href="javascript:void(0)" @click="getPosts">Try again?</a>
    </div>
    <!-- Every post in their own component -->
    <Post
      v-for="post in dashBoardData.data.posts"
      :key="post.id"
      :post-data="post"
    />

    <!-- Controls for navigating pages -->
    <Controls />
  </div>
</template>

<script>
import { mapState } from "vuex";
import Post from "./Post.vue";
import Controls from "./Controls.vue";

export default {
  name: "DashBoard",
  components: {
    Post,
    Controls
  },
  // Get data() from vuex stores
  computed: {
    ...mapState(["dashBoardData", "searchData", "generalData"])
  }
};
</script>
