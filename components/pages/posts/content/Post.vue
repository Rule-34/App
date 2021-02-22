<template>
  <figure class="text-center material-container text-default-text">
    <!-- Media -->
    <div @click="isActive = !isActive">
      <template v-if="error.show">
        <Error
          :show-action="false"
          :render-borders="false"
          :error-data="error.message"
        />
      </template>

      <template v-else-if="isImage">
        <img
          :src="mediaResolutionChooser.url"
          loading="'lazy'"
          :class="{
            'opacity-100': media.hasLoaded,
          }"
          :alt="'Image ' + post.id"
          class="w-full h-auto opacity-0 post-animation"
          :height="mediaResolutionChooser.height"
          :width="mediaResolutionChooser.width"
          referrerpolicy="no-referrer"
          decoding="async"
          @load="media.hasLoaded = true"
          @error="retryToLoadManager"
        />
      </template>

      <template v-else-if="isVideo">
        <!-- TODO: Show button to show tags -->

        <video
          :alt="'Video ' + post.id"
          class="w-full h-auto"
          preload="none"
          :poster="post.preview_file.url"
          controls
          loop
          playsinline
        >
          <source
            :src="mediaResolutionChooser.url"
            @error="retryToLoadManager"
          />
          Your browser does not support HTML5 video.
        </video>
      </template>
    </div>

    <figcaption class="flex flex-wrap overflow-hidden text-sm">
      <!-- Tags -->
      <template v-if="post.tags.length">
        <div class="w-full overflow-hidden">
          <TransitionCollapse>
            <div v-if="isActive">
              <!-- Workaround for this not jumping is having a div before -->
              <div class="min-w-full tag-container">
                <button
                  v-for="tag in post.tags"
                  :key="tag"
                  type="button"
                  class="tag color-util"
                  @click="fetchSpecificTag(tag)"
                  v-text="tag"
                />
              </div>
            </div>
          </TransitionCollapse>
        </div>
      </template>

      <!-- Source -->
      <template v-if="post.source.length">
        <div class="w-full p-1 text-center">
          <template v-if="isUrl">
            <!-- If text is an Url then make it linkable -->
            <a
              :href="post.source[0]"
              class="inline-flex"
              rel="noopener"
              target="_blank"
            >
              <p class="color-util">
                {{ sourceText }}
              </p>

              <!-- Icon -->
              <ExternalLinkIcon class="w-5 h-5 ml-2 icon text-default" />
            </a>
          </template>

          <template v-else>
            <!-- If the text is not a url then just show the text -->
            <p title="Source">{{ sourceText }}</p>
          </template>
        </div>
      </template>
    </figcaption>
  </figure>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ExternalLinkIcon } from 'vue-feather-icons'

import TransitionCollapse from '~/components/utils/TransitionCollapse.vue'
import Error from '~/components/utils/Error'

export default {
  components: { Error, TransitionCollapse, ExternalLinkIcon },

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
      isActive: false,

      media: {
        hasLoaded: false,

        retryLogic: {
          count: 0,

          tried: {
            extraSlash: false,
            proxy: false,
            proxyWithExtraSlash: false,
          },
        },
      },

      error: {
        show: false,
        message: 'An error ocurred.',
      },
    }
  },

  computed: {
    ...mapGetters('user', ['getUserSettings']),

    // #region Post media
    isImage() {
      return this.post.media_type === 'image'
    },

    isVideo() {
      return this.post.media_type === 'video'
    },

    mediaResolutionChooser() {
      // Always return high res file if its a video
      if (this.isVideo && this.post.high_res_file) {
        return this.post.high_res_file
      }

      // Return full image if its setting is enabled OR if low resolution file doesn't exist
      if (
        !this.post.low_res_file.url ||
        this.getUserSettings.fullSizeImages.value
      ) {
        return this.post.high_res_file
      }

      // Return low res file
      return this.post.low_res_file
    },
    // #endregion

    // #region Post media
    isUrl() {
      return this.post.source[0].startsWith('http', 'www')
    },

    sourceText() {
      if (this.isUrl) {
        return new URL(this.post.source[0]).hostname
      }

      // Return the entire source as it's text
      return this.post.source[0]
    },
    // #endregion
  },

  mounted() {
    if (!this.isVideo && !this.isImage) {
      const message = 'Unknown media type.'

      console.warn(message)

      this.error.message = message
      this.error.show = true
    }
  },

  methods: {
    ...mapActions('booru', ['tagsManager']),

    // #region Post media
    retryToLoadManager(event) {
      // console.log('Media source: ', event.target.src)

      if (this.showError) {
        const message = 'An error is set.'

        console.warn(message)
        return
      }

      if (this.$nuxt.isOffline) {
        const message = 'Browser is offline.'

        console.warn(message)

        this.error.message = message
        this.error.show = true
        return
      }

      // Add extra slash to URL
      if (!this.media.retryLogic.tried.extraSlash) {
        console.info('Adding extra slash...')

        event.target.src = this.addExtraSlashToURL(
          this.mediaResolutionChooser.url
        )

        if (this.isVideo) {
          console.info('Reloading data and playing video')
          event.target.parentElement.load()
          event.target.parentElement.play()
        }

        this.media.retryLogic.tried.extraSlash = true
      }

      // Proxy URL
      else if (!this.media.retryLogic.tried.proxy) {
        console.info('Proxying media...')

        event.target.src = this.addProxyToURL(this.mediaResolutionChooser.url)

        if (this.isVideo) {
          console.info('Reloading data and playing video')
          event.target.parentElement.load()
          event.target.parentElement.play()
        }

        this.media.retryLogic.tried.proxy = true
      }

      // Proxy URL with extra slash
      else if (!this.media.retryLogic.tried.proxyWithExtraSlash) {
        console.info('Proxying media with extra slash...')

        event.target.src = this.addProxyToURL(
          this.addExtraSlashToURL(this.mediaResolutionChooser.url)
        )

        if (this.isVideo) {
          console.info('Reloading data and playing video')
          event.target.parentElement.load()
          event.target.parentElement.play()
        }

        this.media.retryLogic.tried.proxyWithExtraSlash = true
      }

      // Retry to load it
      else if (
        this.media.retryLogic.count < this.getUserSettings.imgRetry.value
      ) {
        console.info(
          `Retry number ${this.media.retryLogic.count} to load the media`
        )

        event.target.src = ''

        event.target.src = this.mediaResolutionChooser.url

        if (this.isVideo) {
          console.info('Reloading data and playing video')
          event.target.parentElement.load()
          event.target.parentElement.play()
        }

        this.media.retryLogic.count++
      }

      // At last, show error
      else {
        const message = 'Can not load media.'

        console.warn(message)

        this.error.message = message
        this.error.show = true
      }
    },

    addProxyToURL(url) {
      return this.$config.PROXY_URL + url
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
    // #endregion

    // #region Post tags
    fetchSpecificTag(tag) {
      this.tagsManager({
        operation: 'set',
        value: [tag],
      })
    },
    // #endregion
  },
}
</script>

<style lang="postcss">
.post-animation {
  transition: opacity 0.75s;
}
</style>
