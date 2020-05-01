<template>
  <div>
    <!-- if media is an Image -->
    <!-- Loading is determined if settings are lazy -->
    <img
      v-if="post.type === 'image'"
      :src="imageSource()"
      :loading="userSettings.lazyLoading.value ? 'lazy' : 'auto'"
      :class="{
        'post-animation': userSettings.animations.value && mediaLoaded,
      }"
      :alt="'Image ' + post.id"
      class="w-full h-auto"
      @load="mediaLoaded = true"
      @error="retryToLoadMedia($event)"
    />

    <!-- if its a Video -->
    <!-- If lazy loading enabled -->
    <video
      v-else-if="post.type === 'video'"
      :controls="userSettings.videoControls.value"
      :alt="'Video ' + post.id"
      class="w-full h-auto"
      preload="none"
      :poster="post.preview_file"
      loop
    >
      <source :src="post.high_res_file" @error="retryToLoadMedia($event)" />
      Your browser doesnt support HTML5 video.
    </video>

    <!-- if its not an image or a video -->
    <p v-else v-text="'Unknown type of media: ' + post.type" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PostMedia',

  props: {
    post: {
      type: Object,
      default() {
        return undefined
      },
    },
  },

  data() {
    return {
      mediaLoaded: false,
      retryCount: 0,
    }
  },

  computed: {
    ...mapState(['userSettings']),
  },

  methods: {
    // Retries to load the image
    retryToLoadMedia(event) {
      // console.log(event.target, this.retryCount)

      // If browser is offline return execution
      if (this.$nuxt.isOffline) {
        // If we have not reached the limit
      } else if (this.retryCount < this.userSettings.imgRetry.value) {
        // Save current source
        const imgSrc = event.target.src

        // Delete source
        event.target.src = ''

        // Set source again to force reload
        event.target.src = imgSrc

        // console.log(this.retryCount)

        // Add one
        this.retryCount++
      } else {
        // console.log('Cant load the image')

        // Set error image
        event.target.src = require('~/assets/img/utils/error.png')

        // Stop retrying // This doesnt do anything
        event.target.onerror = null
      }
    },

    // Image source
    imageSource() {
      // Return full image if its setting is enabled OR if low resolution file doesnt exist
      if (this.userSettings.fullSizeImages.value || !this.post.low_res_file) {
        return this.post.high_res_file

        // Else return low res file
      } else {
        return this.post.low_res_file
      }
    },
  },
}
</script>

<style lang="postcss">
.post-animation {
  animation: fade 0.75s ease-in-out forwards;
}

@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
