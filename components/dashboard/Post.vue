<template>
  <!-- Makes element zoomable if setting is enabled -->
  <figure :class="{ zoom: userSettings.zoom.value }" class="material-container">
    <!-- TODO: style="max-height: 80vh;" TODO: good for image previews -->

    <!-- Images and videos -->

    <!-- if media is a Image -->
    <template v-if="post.type === 'image'">
      <!-- If lazy loading enabled -->
      <template v-if="userSettings.lazyLoading.value">
        <img
          v-lazy="imageSource()"
          :alt="post.type"
          :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
          class="post-img"
          @click="toggleTags"
        />
      </template>

      <!-- If lazy loading disabled -->
      <template v-else>
        <!-- Source is a computed poperty for better code -->
        <img
          :src="imageSource()"
          :alt="post.type"
          :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
          class="post-img"
          @click="toggleTags"
        />
      </template>
    </template>

    <!-- if its a Video -->
    <template v-else-if="post.type === 'video'">
      <!-- If lazy loading enabled -->
      <template v-if="userSettings.lazyLoading.value">
        <lazy-component>
          <video
            :alt="post.type"
            :controls="userSettings.videoControls.value"
            :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
            class="post-img"
            muted
            loop
            @click="toggleTags"
          >
            <source :src="post.high_res_file" />
            Your browser doesnt support HTML5 video.
          </video>
        </lazy-component>
      </template>

      <!-- If lazy loading disabled -->
      <template v-else>
        <video
          :alt="post.type"
          :controls="userSettings.videoControls.value"
          :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
          class="post-img"
          muted
          loop
          @click="toggleTags"
        >
          <source :src="post.high_res_file" />
          Your browser doesnt support HTML5 video.
        </video>
      </template>
    </template>

    <!-- if its not an image or a video -->
    <template v-else>Unknown type of media: {{ post.type }}</template>

    <!-- Tags and source -->
    <figcaption class="flex flex-wrap overflow-hidden text-sm">
      <!-- Tags -->
      <!-- Component to apply the collapse transition -->
      <TransitionCollapse>
        <!-- Only show them if they exist and the component is toggled -->
        <!-- Workaround for this not jumping is applying collapse to the div before div with padding/margin -->
        <div v-if="post.tags && isActive">
          <div class="w-full tag-container p-1">
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
      <div
        v-if="post.source"
        key="source"
        class="w-full m-auto text-center p-1"
      >
        <!-- If text is an Url then make it linkable -->
        <template v-if="isUrl()">
          <a
            :href="post.source"
            class="inline-flex"
            rel="noreferrer noopener nofollow"
            target="_blank"
          >
            <p
              class="text-primary-hover hover:text-primary"
              v-text="'Source'"
            />
            <ExternalLinkIcon class="icon text-default w-5 h-5 ml-2" />
          </a>
        </template>

        <!-- If the text is not a url then just show the text -->
        <template v-else>
          <p title="Source" class="text-default-text" v-text="post.source" />
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
import TransitionCollapse from '~/components/general/TransitionCollapse'

export default {
  name: 'Post',

  components: { ExternalLinkIcon, TransitionCollapse },

  props: {
    post: {
      type: Object,
      default() {
        return {}
      },
    },
  },

  data() {
    return {
      // Internal toggle for showing tags
      isActive: false,
    }
  },

  computed: {
    ...mapState(['searchData', 'userSettings']),
  },

  methods: {
    ...mapMutations(['pidManager', 'tagManager']),
    ...mapActions(['getPosts', 'analyticManager']),
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

    // Toggle showing tags on click
    toggleTags() {
      this.isActive = !this.isActive
    },
    getSpecificTag(tag) {
      // Set PID to 0 since we're searching for new tags
      this.pidManager({ operation: 'reset' })

      // Reset all tags
      this.tagManager({
        operation: 'reset',
      })

      // Add clicked tag
      this.tagManager({
        operation: 'add',
        tag: {
          name: tag,
        },
      })

      // Search for the tag
      this.getPosts()

      // And fire analytics
      this.analyticManager('tags')
    },
  },
}
</script>
