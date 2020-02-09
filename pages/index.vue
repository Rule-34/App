<template>
  <main>
    <!-- Menu -->
    <div class="m-5 flex flex-row justify-between">
      <!-- Domain selector -->
      <DomainSelector class="my-auto" />

      <!-- Notifications -->
      <Notifications />
    </div>

    <!-- If theres request got errors -->
    <Errors />

    <!-- every post in their own component -->
    <Post v-for="post in dashBoardData.data" :key="post.id" :post="post" />

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
        <p class="text-center text-default-text pb-2" @click="concatPost()">
          Loading more posts...
        </p>
        <Errors />
      </div>
    </template>
  </main>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
// Third party
import { Intersect } from 'vuetify/lib/directives/intersect'
import throttle from 'lodash/throttle'
// Components
import DomainSelector from '~/components/components/dashboardMenu/DomainSelector.vue'
import Notifications from '~/components/components/dashboardMenu/Notifications.vue'
import Post from '~/components/content/Post.vue'
import Controls from '~/components/navigation/Controls.vue'
import Errors from '~/components/general/Errors.vue'

export default {
  components: {
    Errors,
    DomainSelector,
    Notifications,
    Post,
    Controls
  },

  directives: {
    Intersect
  },

  // Load the store with posts
  async fetch({ store }) {
    await store.dispatch('getPosts', 'add')
  },

  computed: {
    ...mapState(['dashBoardData', 'userSettings'])
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
    ...mapMutations(['pidManager']),
    ...mapActions(['getPosts']),

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
      this.pidManager({ operation: 'add' })

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

            console.log('Loading next page')
            break

          case 37:
            this.$refs.controls.getPrevPage()
            this.scrollToTop()

            console.log('Loading Prev page')
            break
        }
      } catch (error) {
        console.error(
          'Couldnt load next page, most likely because infinite loading is enabled.',
          error
        )
      }
    }
  },

  head() {
    return {
      title: 'Rule 34 App',
      titleTemplate: null
    }
  }
}
</script>
