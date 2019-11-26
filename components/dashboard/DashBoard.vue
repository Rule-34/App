<template>
  <v-container>
    <!-- If theres request got errors -->
    <Errors />

    <!-- every post in their own component -->
    <Post
      v-for="post in dashBoardData.data.posts"
      :key="post.id"
      :post-data="post"
    />

    <Controls />
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Errors from './Errors.vue'
import Post from './Post.vue'
import Controls from './Controls.vue'

export default {
  name: 'DashBoard',
  components: {
    Errors,
    Post,
    Controls
  },
  // Get data() from vuex stores
  computed: {
    ...mapState(['dashBoardData', 'userSettings'])
  },
  created() {
    // Navigation with keyboard
    if (this.userSettings.keyboardControls.value) {
      document.addEventListener('keyup', this.navigation)
    }
  },

  destroyed() {
    // Navigation with keyboard
    if (this.userSettings.keyboardControls.value) {
      document.removeEventListener('keyup', this.navigation)
    }
  },

  methods: {
    ...mapActions(['pidManager', 'getPosts']),

    scrollToTop() {
      window.scrollTo(0, 0)
    },

    // Infinite loading
    concatPost() {
      console.log('Loaded more posts')
      // Get next PID
      this.pidManager({
        operation: 'add'
      })

      // And load next posts
      this.getPosts('concat')
    },
    // Navigation with keyboard
    navigation() {
      try {
        switch (event.keyCode) {
          case 39:
            this.$refs.controls.getNextPage()
            this.scrollToTop()
            // console.log("Loading next page");
            break

          case 37:
            this.$refs.controls.getPrevPage()
            this.scrollToTop()
            // console.log("Loading Prev page");
            break
        }
      } catch (error) {
        console.error(
          'Couldnt load next page, most likely because infinite loading is enabled.',
          error
        )
      }
    }
  }
}
</script>
