<template>
  <div>
    <!-- If theres request got errors -->
    <Errors />

    <DashBoardSettings />
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
      <!-- If theres more posts -->
      <div v-intersect.quiet="throttleInfiniteLoading" class="mx-auto">
        <p @click="concatPost()" class="text-center text-gray-500 pb-2">
          Loading more posts...
        </p>
        <Errors />
      </div>
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { Intersect } from 'vuetify/es5/directives/intersect'
import throttle from 'lodash/throttle'
import Errors from './Errors.vue'
import DashBoardSettings from './DashBoardSettings.vue'
import Post from './Post.vue'
import Controls from './Controls.vue'

export default {
  name: 'DashBoard',
  components: {
    Errors,
    DashBoardSettings,
    Post,
    Controls,
  },
  directives: {
    Intersect,
  },
  // Get data() from vuex stores
  computed: {
    ...mapState(['dashBoardData', 'userSettings']),
  },
  created() {
    // Navigation with keyboard
    if (this.userSettings.keyboardControls.value) {
      // eslint-disable-next-line nuxt/no-globals-in-created
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

    throttleInfiniteLoading: throttle(function() {
      this.concatPost()
    }, 5000),

    // Infinite loading
    concatPost() {
      console.log('Loaded more posts')
      // Get next PID
      this.pidManager('add')

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
    },
  },
}
</script>
