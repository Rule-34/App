<template>
  <div>
    <!-- If theres request got errors -->
    <Errors />
    <!-- every post in their own component -->
    <Post
      v-for="post in dashBoardData.data.posts"
      :key="post.id"
      :post-data="post"
    />

    <!-- Controls for navigating pages -->
    <Controls />

    <div v-if="userSettings.hoverControls" class="my-6">&nbsp;</div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Errors from "./Errors.vue";
import Post from "./Post.vue";
import Controls from "./Controls.vue";

export default {
  name: "DashBoard",
  components: {
    Errors,
    Post,
    Controls
  },
  // Get data() from vuex stores
  computed: {
    ...mapState(["dashBoardData", "searchData", "generalData", "userSettings"])
  }
};
</script>
