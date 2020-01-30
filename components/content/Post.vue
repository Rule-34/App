<template>
  <!-- Makes element zoomable if setting is enabled -->
  <figure
    :class="{ zoom: userSettings.zoom.value }"
    class="material-container text-default-text text-center"
  >
    <!-- TODO: style="max-height: 80vh;" TODO: good for image previews -->

    <!-- Images and videos -->

    <!-- if media is an Image -->
    <template v-if="post.type === 'image'">
      <!-- Source is determined from user Settings -->
      <!-- Loading is determined if settings are lazy -->
      <img
        :src="imageSource()"
        :loading="userSettings.lazyLoading.value ? 'lazy' : 'auto'"
        :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
        alt="image"
        class="post"
        @click="toggleTags"
        @load="addAnimation($event)"
        @error="retryToLoadMedia($event)"
      />
    </template>

    <!-- if its a Video -->
    <template v-else-if="post.type === 'video'">
      <!-- If lazy loading enabled -->
      <video
        :controls="userSettings.videoControls.value"
        :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
        alt="video"
        class="w-full"
        muted
        loop
        @click="toggleTags"
      >
        <source :src="post.high_res_file" @error="retryToLoadMedia($event)" />
        Your browser doesnt support HTML5 video.
      </video>
    </template>

    <!-- if its not an image or a video -->
    <template v-else>
      <p v-text="'Unknown type of media: ' + post.type" />
    </template>

    <!-- Tags and source -->
    <figcaption class="flex flex-wrap overflow-hidden text-sm">
      <!-- Tags -->
      <!-- Component to apply the collapse transition -->
      <TransitionCollapse class="min-w-full">
        <!-- Only show them if they exist and the component is toggled -->
        <!-- Workaround for this not jumping is applying collapse to the div before div with padding/margin -->
        <div v-if="post.tags && isActive">
          <div class="min-w-full tag-container">
            <a
              v-for="tag in post.tags"
              :key="post[tag]"
              class="tag"
              href="#"
              @click="getSpecificTag(tag)"
              v-text="tag"
            />
          </div>
        </div>
      </TransitionCollapse>

      <!-- Source -->
      <div v-if="post.source" class="w-full m-auto p-1">
        <!-- If text is an Url then make it linkable -->
        <template v-if="isUrl()">
          <a
            :href="post.source"
            class="inline-flex"
            rel="noreferrer noopener nofollow"
            target="_blank"
          >
            <p class="color-util m-auto" v-text="'Source'" />
            <ExternalLinkIcon class="icon text-default w-5 h-5 ml-2" />
          </a>
        </template>

        <!-- If the text is not a url then just show the text -->
        <template v-else>
          <p title="Source" v-text="post.source" />
        </template>
      </div>
    </figcaption>
  </figure>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
// Third party
import { ExternalLinkIcon } from 'vue-feather-icons'
// Components
import TransitionCollapse from '~/components/utils/TransitionCollapse.vue'

export default {
  name: 'Post',

  components: { ExternalLinkIcon, TransitionCollapse },

  props: {
    post: {
      type: Object,
      default() {
        return {}
      }
    }
  },

  data() {
    return {
      // Internal toggle for showing tags
      isActive: false,
      retryCount: 0
    }
  },

  computed: {
    ...mapState(['userSettings'])
  },

  methods: {
    ...mapMutations(['pidManager', 'tagManager']),
    ...mapActions(['getPosts', 'analyticManager']),

    // Toggle showing tags on click
    toggleTags() {
      this.isActive = !this.isActive
    },

    addAnimation(event) {
      if (this.userSettings.performance.value) {
        console.log('No animation for you', event)
      } else {
        event.target.classList.toggle('post--active')
      }
    },

    // Retries to load the image
    retryToLoadMedia(event) {
      // console.log(event.target, this.retryCount)

      if (this.retryCount <= this.userSettings.imgRetry.value) {
        // Save current source
        const imgSrc = event.target.src

        // Delete source
        event.target.src = ''

        // Set source again to force reload
        event.target.src = imgSrc

        // Add one
        this.retryCount++
      } else {
        // console.log('Cant load the image')

        // Set error image
        event.target.src = '/img/error.webp'

        // Stop retrying
        event.target.onerror = null
      }
    },

    // Check if its an url
    isUrl() {
      if (this.post.source.startsWith('http', 'www')) {
        // console.log("its a url", this.post.source);
        return true
      } else {
        // console.log("Not a url", this.post.source);
        return false
      }
    },

    // Image source
    imageSource() {
      switch (this.userSettings.fullSizeImages.value) {
        case true:
          return this.post.high_res_file

        case false:
          // If we are on a domain where we dont have low res files, then load high res files as a fallback
          if (this.post.low_res_file) {
            return this.post.low_res_file
          } else {
            return this.post.high_res_file
          }
      }
    },

    getSpecificTag(tag) {
      // Set PID to 0 since we're searching for new tags
      this.pidManager({ operation: 'reset' })

      // Reset all tags
      this.tagManager({
        operation: 'reset'
      })

      // Add clicked tag
      this.tagManager({
        operation: 'add',
        tag: {
          name: tag
        }
      })

      // Search for the tag
      this.getPosts('add')

      // And fire analytics
      this.analyticManager('tags')
    }
  }
}
</script>

<style>
.post {
  transition: opacity 0.75s;
  @apply w-full opacity-0;
}

.post--active {
  @apply opacity-100;
}
</style>
