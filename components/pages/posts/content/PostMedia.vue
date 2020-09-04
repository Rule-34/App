<template>
  <div>
    <template v-if="showError">
      <Error
        :show-action="false"
        :render-borders="false"
        error-data="Media couln't be loaded"
      />
    </template>

    <template v-else-if="isImage">
      <!-- if media is an Image -->
      <img
        :src="mediaResolutionChooser.url"
        :loading="getUserSettings.lazyLoading.value ? 'lazy' : 'auto'"
        :class="{
          'post-animation opacity-0': getUserSettings.animations.value,
          'opacity-100': hasMediaLoaded && getUserSettings.animations.value,
        }"
        :alt="'Image ' + post.id"
        class="w-full h-auto"
        :height="mediaResolutionChooser.height"
        :width="mediaResolutionChooser.width"
        referrerpolicy="no-referrer"
        @load="hasMediaLoaded = true"
        @error="retryToLoadManager($event)"
      />
    </template>

    <template v-else-if="isVideo">
      <!-- if its a Video -->
      <video
        :controls="getUserSettings.videoControls.value"
        :alt="'Video ' + post.id"
        class="w-full h-auto"
        preload="none"
        :poster="post.preview_file.url"
        loop
        playsinline
      >
        <source
          :src="mediaResolutionChooser.url"
          @error="retryToLoadManager($event)"
        />
        Your browser doesnt support HTML5 video.
      </video>
    </template>

    <template v-else>
      <Error
        :show-action="false"
        :render-borders="false"
        error-data="Unknown media type"
      />
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Error from '~/components/utils/Error'

export default {
  name: 'PostMedia',

  components: { Error },

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
      showError: false,

      hasMediaLoaded: false,

      retryLogic: {
        count: 0,

        tried: {
          proxy: false,
          extraSlash: false,
          proxyWithExtraSlash: false,
        },
      },
    }
  },

  computed: {
    ...mapGetters('user', ['getUserSettings']),
    ...mapGetters(['getCORSProxyURL']),

    isImage() {
      return this.post.media_type === 'image'
    },

    isVideo() {
      return this.post.media_type === 'video'
    },

    mediaResolutionChooser() {
      // Always return high res file if its a video
      if (this.isVideo) return this.post.high_res_file

      // Return full image if its setting is enabled OR if low resolution file doesnt exist
      if (
        this.getUserSettings.fullSizeImages.value ||
        !this.post.low_res_file.url
      ) {
        return this.post.high_res_file
      }

      // Return low res file
      else {
        return this.post.low_res_file
      }
    },
  },

  methods: {
    retryToLoadManager(event) {
      // console.log('Media source: ', event.target.src)

      if (this.showError) {
        console.debug('Error set, dont try to load image anymore')
        return
      }

      if (this.$nuxt.isOffline) {
        console.debug('Browser offline, dont try to load image anymore')
        this.showError = true
        return
      }

      // Proxy URL
      if (!this.retryLogic.tried.proxy) {
        console.debug('Proxying media')

        event.target.src = this.addProxyToURL(this.mediaResolutionChooser.url)

        if (this.isVideo) {
          console.debug('Reloading data and playing video')
          this.reloadVideoElement(event.target.parentElement)
        }

        this.retryLogic.tried.proxy = true
      }

      // Add extra slash to URL
      else if (!this.retryLogic.tried.extraSlash) {
        console.debug('Adding extra slash')

        event.target.src = this.addExtraSlashToURL(
          this.mediaResolutionChooser.url
        )

        if (this.isVideo) {
          console.debug('Reloading data and playing video')
          this.reloadVideoElement(event.target.parentElement)
        }

        this.retryLogic.tried.extraSlash = true
      }

      // Proxy URL with extra slash
      else if (!this.retryLogic.tried.proxyWithExtraSlash) {
        console.debug('Proxying media with extra slash')

        event.target.src = this.addProxyToURL(
          this.addExtraSlashToURL(this.mediaResolutionChooser.url)
        )

        if (this.isVideo) {
          console.debug('Reloading data and playing video')
          this.reloadVideoElement(event.target.parentElement)
        }

        this.retryLogic.tried.proxyWithExtraSlash = true
      }

      // Retry to load it
      else if (this.retryLogic.count < this.getUserSettings.imgRetry.value) {
        console.debug(`Retry ${this.retryLogic.count} to load the media`)

        event.target.src = ''

        event.target.src = this.mediaResolutionChooser.url

        if (this.isVideo) {
          console.debug('Reloading data and playing video')
          this.reloadVideoElement(event.target.parentElement)
        }

        this.retryLogic.count++
      }

      // At last, show error
      else {
        console.debug("Can't load media")

        this.showError = true
      }
    },

    reloadVideoElement(videoElement) {
      videoElement.load()
      videoElement.play()
    },

    addProxyToURL(url) {
      return this.getCORSProxyURL + '?q=' + url
    },

    addExtraSlashToURL(url) {
      const currentURL = new URL(url)

      /* console.log({
        original: currentURL.toString(),
        modified: currentURLWithExtraSlash,
      }) */

      return currentURL
        .toString()
        .replace(currentURL.hostname, currentURL.hostname + '/')
    },
  },
}
</script>

<style lang="postcss">
.post-animation {
  transition: opacity 0.75s;
}
</style>
