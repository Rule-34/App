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
    <Controls ref="controls" />

    <div v-if="userSettings.hoverControls.value" class="my-6">&nbsp;</div>
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
  },

  mounted() {
    document.addEventListener("keyup", this.navigation);
  },

  destroyed() {
    document.removeEventListener("keyup", this.navigation);
  },

  methods: {
    scrollToTop() {
      window.scrollTo(0, 0);
    },
    // Navigation with keyboard
    navigation() {
      if (event.keyCode == 39) {
        this.$refs.controls.getNextPage();
        this.scrollToTop();
        // console.log("derecha");
      } else if (event.keyCode == 37) {
        // console.log("izquierda");
        this.$refs.controls.getLastPage();
        this.scrollToTop();
      }
    }
  }
};
</script>
