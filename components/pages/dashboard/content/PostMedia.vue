<template>
  <div>
    <!-- if media is an Image -->
    <img
      v-if="post.media_type === 'image'"
      :src="mediaResolutionChooser().url"
      :loading="settings.lazyLoading.value ? 'lazy' : 'auto'"
      :class="{
        'post-animation opacity-0': settings.animations.value,
        'opacity-100': settings.animations.value && mediaLoaded,
      }"
      :alt="'Image ' + post.id"
      class="w-full h-auto"
      :height="mediaResolutionChooser().height"
      :width="mediaResolutionChooser().width"
      @load="mediaLoaded = true"
      @error="retryToLoadMedia($event)"
    />

    <!-- if its a Video -->
    <video
      v-else-if="post.media_type === 'video'"
      :controls="settings.videoControls.value"
      :alt="'Video ' + post.id"
      class="w-full h-auto"
      preload="none"
      :poster="post.preview_file.url"
      loop
    >
      <source :src="post.high_res_file.url" @error="retryToLoadMedia($event)" />
      Your browser doesnt support HTML5 video.
    </video>

    <p v-else class="text-center text-default-text">Unknown media type</p>
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
    ...mapState(['general']),
    ...mapState('user', ['settings']),
  },

  methods: {
    retryToLoadMedia(event) {
      // console.log(event.target, this.retryCount)

      const isVideo = event.target.parentElement.nodeName === 'VIDEO'

      // If browser is offline return
      if (this.$nuxt.isOffline) return

      // Proxy images if they fail to load
      if (this.retryCount === 0) {
        console.debug('Proxifying media')

        event.target.src = this.general.CORSProxyURL + '?q=' + event.target.src

        if (isVideo) {
          console.debug('Reloading data and playing video')

          event.target.parentElement.load()
          event.target.parentElement.play()
        }

        this.retryCount++
      }

      // If we have not reached the limit
      else if (this.retryCount < this.settings.imgRetry.value) {
        const originalImgSrc = event.target.src

        event.target.src = ''

        event.target.src = originalImgSrc

        // console.log(this.retryCount, originalImgSrc)

        this.retryCount++
      }

      // Load error image
      else {
        // console.log('Cant load the image')

        // Set error image
        if (isVideo) {
          event.target.parentElement.poster = require('~/assets/img/utils/error.png')
        } else {
          event.target.src = require('~/assets/img/utils/error.png')
        }

        // Stop retrying // This doesnt do anything
        event.target.onerror = null
      }
    },

    mediaResolutionChooser() {
      // Return full image if its setting is enabled OR if low resolution file doesnt exist
      if (this.settings.fullSizeImages.value || !this.post.low_res_file.url) {
        return this.post.high_res_file
      }

      // Return low res file
      else {
        return this.post.low_res_file
      }
    },
  },
}
</script>

<style lang="postcss">
.post-animation {
  transition: opacity 0.75s;
}
</style>
