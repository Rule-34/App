<template>
  <figure class="material-container">
    <!-- Media -->
    <template v-if="error.show">
      <Error
        :show-action="false"
        :render-borders="false"
        :error-data="error.message"
      />
    </template>

    <template v-else-if="isImage">
      <!-- Fix for weird space below button -->
      <div class="flex">
        <button
          type="button"
          :aria-expanded="isActive"
          aria-label="Toggle tags panel"
          class="relative w-full group"
          @click="toggleTags"
          @keydown.enter="toggleTags"
        >
          <img
            :src="mediaResolutionChooser.url"
            :height="mediaResolutionChooser.height"
            :width="mediaResolutionChooser.width"
            :alt="'Image ' + postData.id"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            class="w-full h-auto transition-opacity duration-700 opacity-0"
            :class="{
              'opacity-100': media.hasLoaded,
            }"
            @load="media.hasLoaded = true"
            @error="retryToLoadManager"
          />

          <!-- Fix for focus ring not applying on other elements -->
          <div class="absolute inset-0 ring-inset group-focus:focus-util"></div>
        </button>
      </div>
    </template>

    <template v-else-if="isVideo">
      <div class="relative">
        <video
          preload="none"
          :poster="postData.preview_file.url"
          :alt="'Video ' + postData.id"
          controls
          loop
          playsinline
          class="w-full h-auto"
        >
          <source
            :src="mediaResolutionChooser.url"
            @error="retryToLoadManager"
          />
          Your browser does not support HTML5 video.
        </video>

        <!-- Video tag button -->
        <div class="absolute inset-y-0 right-0 p-4 pointer-events-none">
          <div class="flex flex-col items-center justify-center w-full h-full">
            <button
              type="button"
              aria-label="Toggle tags panel"
              class="p-1 bg-black border border-transparent rounded-lg pointer-events-auto bg-opacity-40 group focus:focus-util"
              @click="toggleTags"
            >
              <TagIcon
                class="w-5 h-5 text-gray-200 transition-colors duration-300 icon group-hover:text-white"
              />
            </button>
          </div>
        </div>
      </div>
    </template>

    <figcaption class="flex flex-wrap overflow-hidden text-sm">
      <!-- Action bar & Tags -->
      <template v-if="postData.tags.length">
        <div class="w-full overflow-hidden">
          <TransitionCollapse>
            <!-- Workaround for content not jumping is having a div before -->
            <div v-if="isActive">
              <!-- Action bar -->
              <div class="flex items-center bg-darkGray-100 justify-evenly">
                <!--  -->

                <!-- Saucenao -->
                <template v-if="!error.show && !isVideo">
                  <template v-if="isUserPremium">
                    <a
                      :href="`https://saucenao.com/search.php?url=${mediaResolutionChooser.url}`"
                      target="_blank"
                      class="flex items-center gap-2 my-2 link"
                    >
                      <SearchIcon class="w-5 h-5 icon" />

                      Saucenao
                    </a>
                  </template>

                  <template v-else>
                    <NuxtLink
                      to="/premium"
                      class="flex items-center gap-2 my-2 link"
                    >
                      <SearchIcon class="w-5 h-5 icon" />

                      Saucenao
                    </NuxtLink>
                  </template>
                </template>
              </div>

              <!-- Tags -->
              <div class="min-w-full tag-container">
                <button
                  v-for="tag in postData.tags"
                  :key="tag"
                  type="button"
                  class="tag link"
                  @click="fetchSpecificTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </TransitionCollapse>
        </div>
      </template>

      <!-- Source -->
      <template v-if="postData.source.length">
        <div class="w-full p-1 text-center">
          <template v-if="isUrl">
            <!-- If text is an Url then make it linkable -->
            <a
              :href="postData.source[0]"
              class="inline-flex gap-2 link"
              target="_blank"
            >
              <p class="link">
                {{ sourceText }}
              </p>

              <!-- Icon -->
              <ExternalLinkIcon class="w-5 h-5 icon" />
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
import { ExternalLinkIcon, TagIcon, SearchIcon } from 'vue-feather-icons'

export default {
  components: { ExternalLinkIcon, TagIcon, SearchIcon },

  props: {
    postData: {
      type: Object,
      required: true,
    },

    viewOnly: {
      type: Boolean,
      default: false,
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
    ...mapGetters('premium', ['isUserPremium']),

    // #region Post media
    isImage() {
      return this.postData.media_type === 'image'
    },

    isVideo() {
      return this.postData.media_type === 'video'
    },

    mediaResolutionChooser() {
      // Always return high res file if its a video
      if (this.isVideo && this.postData.high_res_file) {
        return this.postData.high_res_file
      }

      // Return full image if its setting is enabled OR if low resolution file doesn't exist
      if (
        !this.postData.low_res_file.url ||
        this.getUserSettings.fullSizeImages.value
      ) {
        return this.postData.high_res_file
      }

      // Return low res file
      return this.postData.low_res_file
    },
    // #endregion

    // #region Post media
    isUrl() {
      return this.postData.source[0].startsWith('http', 'www')
    },

    sourceText() {
      if (this.isUrl) {
        return new URL(this.postData.source[0]).hostname
      }

      // Return the entire source as it's text
      return this.postData.source[0]
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

    toggleTags() {
      this.isActive = !this.isActive
    },

    // #region Post media
    async retryToLoadManager(event) {
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
          await event.target.parentElement.play()
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
          await event.target.parentElement.play()
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
          await event.target.parentElement.play()
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
          await event.target.parentElement.play()
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

      // console.debug(event.target.src)
    },

    addProxyToURL(url) {
      return this.$config.PROXY_URL + encodeURIComponent(url)
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
      if (this.viewOnly) {
        console.info('View only')
        return
      }

      this.tagsManager({
        operation: 'set',
        value: [tag],
      })
    },
    // #endregion
  },
}
</script>
