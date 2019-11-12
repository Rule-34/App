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

    <!-- If infinite load is NOT enabled -->
    <template v-if="!userSettings.infiniteLoad.value">
      <!-- Controls for navigating pages -->
      <Controls ref="controls" />

      <!-- Add extra spacing if setting hovering control to settle in -->
      <div v-if="userSettings.hoverControls.value" class="my-6">&nbsp;</div>
    </template>
    <template v-else>
      <div class="mx-auto">
        <p class="text-center text-gray-500 pb-2">Loading more posts...</p>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
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
  // Infinite loading
  data() {
    return {
      bottom: false
    };
  },
  // Get data() from vuex stores
  computed: {
    ...mapState(["dashBoardData", "userSettings"])
  },
  // Infinite loading
  watch: {
    bottom(bottom) {
      if (bottom) {
        this.concatPost();
      }
    }
  },
  created() {
    let self = this;
    // Navigation with keyboard
    if (this.userSettings.keyboardControls.value) {
      document.addEventListener("keyup", this.navigation);
    }

    // If infinite loading is enabled
    if (this.userSettings.infiniteLoad.value) {
      // console.log("Injected scroll");
      window.addEventListener("scroll", this.infiniteTester);
    }
  },

  destroyed() {
    // Navigation with keyboard
    if (this.userSettings.keyboardControls.value) {
      document.removeEventListener("keyup", this.navigation);
    }
    // If infinite loading is enabled
    if (this.userSettings.infiniteLoad.value) {
      window.removeEventListener("scroll", this.infiniteTester);
    }
  },

  methods: {
    ...mapActions(["pidManager", "getPosts"]),

    scrollToTop() {
      window.scrollTo(0, 0);
    },

    // Infinite loading
    infiniteTester() {
      this.bottom = this.isBottomVisible();
      // console.log("Fired scroll");
    },

    // Infinite loading
    isBottomVisible() {
      const scrollY = window.scrollY;
      const visible = document.documentElement.clientHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const bottomOfPage = visible + scrollY >= pageHeight;
      return bottomOfPage || pageHeight < visible;
    },

    // Infinite loading
    concatPost() {
      if (this.isBottomVisible()) {
        // console.log("Loaded more posts");
        // Get next PID
        this.pidManager({
          function: "add"
        });

        // And load next posts
        this.getPosts("concat");
      }
    },
    // Navigation with keyboard
    navigation() {
      if (event.keyCode == 39) {
        this.$refs.controls.getNextPage();
        this.scrollToTop();
        // console.log("Loading next page");
      } else if (event.keyCode == 37) {
        // console.log("Loading last page");
        this.$refs.controls.getLastPage();
        this.scrollToTop();
      } else {
        return false;
      }
    }
  }
};
</script>
