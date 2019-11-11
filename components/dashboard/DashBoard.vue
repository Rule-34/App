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
    document.addEventListener("keyup", this.Navigation);
  },

  destroyed() {
    document.removeEventListener("keyup", this.Navigation);
  },

  methods: {
    nextItem() {
      if (event.keyCode == 39) {
        this.currentItem--;
      } else if (event.keyCode == 37) {
        this.currentItem++;
      }
    }
  }
};
</script>
