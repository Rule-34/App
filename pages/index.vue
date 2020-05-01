<template>
  <main>
    <!-- Menu -->
    <div class="m-5 flex flex-row justify-between">
      <!-- Domain selector -->
      <BooruSelector class="my-auto" />

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
import BooruSelector from '~/components/components/dashboardMenu/BooruSelector.vue'
import Post from '~/components/components/post/Post.vue'
import Controls from '~/components/navigation/Controls.vue'
import Errors from '~/components/general/Errors.vue'
// Lazy loaded components
const Notifications = () =>
  import(
    /* webpackPrefetch: true */ '~/components/components/dashboardMenu/Notifications.vue'
  )

export default {
  components: {
    Errors,
    BooruSelector,
    Notifications,
    Post,
    Controls,
  },

  directives: {
    Intersect,
  },

  // Load the store with posts
  async fetch({ store }) {
    await store.dispatch('fetchWithMode', { mode: 'posts', returnMode: 'add' })
  },

  computed: {
    ...mapState(['dashBoardData', 'userSettings']),
  },

  mounted() {
    // Load the store with posts
    // window.onNuxtReady(() => {
    //   this.fetchWithMode({ mode: 'posts', returnMode: 'add' })
    // })

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
    ...mapActions(['fetchWithMode']),

    scrollToTop() {
      window.scrollTo(0, 0)
    },

    throttleInfiniteLoading: throttle(function () {
      this.concatPost()
    }, 5000),

    // Infinite loading
    async concatPost() {
      console.debug('Loaded more posts')
      // Get next PID
      this.pidManager({ operation: 'add' })

      // And load next posts
      await this.fetchWithMode({ mode: 'posts', returnMode: 'concat' })
    },
    // Navigation with keyboard
    navigation() {
      try {
        switch (event.keyCode) {
          case 39:
            this.$refs.controls.getNextPage()
            this.scrollToTop()

            console.debug('Loading next page')
            break

          case 37:
            this.$refs.controls.getPrevPage()
            this.scrollToTop()

            console.debug('Loading Prev page')
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

  head() {
    return {
      title: 'Rule 34 App',
      titleTemplate: null,
    }
  },
}
</script>
