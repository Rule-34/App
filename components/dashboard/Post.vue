<template>
  <!-- Loop for every post -->
  <div :class="{ zoom: userSettings.zoom.value }" class="material-container">
    <!-- TODO: style="max-height: 80vh;" TODO: good for image previews -->

    <!--  @@@@@@@@@@@@@@@@@@@@@@@@ 
          @@@@@@@@@@@@@@@@@@@@@@@@ Images and videos
          @@@@@@@@@@@@@@@@@@@@@@@@
    -->

    <!-- if Image -->
    <template v-if="post.type === 'image'">
      <!-- If lazy loading enabled -->
      <template v-if="userSettings.lazyLoading.value">
        <img
          v-lazy="imageSource()"
          :alt="post.type"
          :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
          @click="toggleTags"
          class="post-img"
        />
      </template>

      <!-- If lazy loading disabled -->
      <template v-else>
        <!-- Source is a computed poperty for better code -->
        <img
          :src="imageSource()"
          :alt="post.type"
          :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
          @click="toggleTags"
          class="post-img"
        />
      </template>
    </template>
    <!-- :style="{ height: post.height + 'px', width: post.width + 'px' }" -->

    <!-- if Video -->
    <template v-else-if="post.type === 'video'">
      <!-- If lazy loading enabled -->
      <template v-if="userSettings.lazyLoading.value">
        <lazy-component>
          <video
            :alt="post.type"
            :controls="userSettings.videoControls.value"
            :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
            @click="toggleTags"
            class="post-img"
            muted
            loop
          >
            <source :src="post.high_res_file" />
            Your browser doesnt support HTML5 video.
          </video>
        </lazy-component>
      </template>
      <template v-else>
        <video
          :alt="post.type"
          :controls="userSettings.videoControls.value"
          :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
          @click="toggleTags"
          class="post-img"
          muted
          loop
        >
          <source :src="post.high_res_file" />
          Your browser doesnt support HTML5 video.
        </video>
      </template>
    </template>

    <!-- if Anything else -->
    <template v-else> Unknown type of media: {{ post.type }} </template>

    <!--  @@@@@@@@@@@@@@@@@@@@@@@@ 
          @@@@@@@@@@@@@@@@@@@@@@@@ Tags and source 
          @@@@@@@@@@@@@@@@@@@@@@@@
    -->
    <!-- Double transition since i cant figure out how to make it in one for both when theres source and when there isnt -->
    <transition name="fade">
      <div v-if="post.source || (post.tags && isActive)">
        <transition-group
          name="fade"
          tag="div"
          class="flex flex-wrap overflow-hidden text-sm p-1"
        >
          <!-- Tags -->
          <div
            key="tags"
            v-if="post.tags && isActive"
            class="w-full tag-container"
          >
            <a
              v-for="tag in post.tags"
              :key="post[tag]"
              @click="getSpecificTag(tag)"
              v-text="tag"
              class="tag"
              href="#"
            />
          </div>

          <!-- Source -->
          <div
            key="source"
            v-if="post.source"
            class="w-full m-auto text-center"
          >
            <template v-if="isUrl()">
              <a
                :href="post.source"
                class="inline-flex items-baseline"
                rel="noreferrer noopener nofollow"
                target="_blank"
              >
                <p>Source</p>
                <ExternalLinkIcon class="icon ml-2 text-black w-4 h-4" />
              </a>
            </template>

            <template v-else>
              <p v-text="post.source" title="Source" />
            </template>
          </div>
        </transition-group>
      </div>
      <!-- </div> -->
    </transition>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { ExternalLinkIcon } from 'vue-feather-icons'

export default {
  name: 'Post',
  components: { ExternalLinkIcon },
  props: {
    postData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      // Save data so we can use
      post: this.postData,
      // Internal toggle for showing tags
      isActive: false,
    }
  },
  computed: {
    ...mapState(['searchData', 'userSettings']),
  },
  methods: {
    ...mapMutations(['newSearchData']),
    ...mapActions(['pidManager', 'getPosts', 'analyticManager']),
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
      this.pidManager({
        operation: 'reset',
      })

      // Reset all tags
      this.newSearchData({
        tag: {
          operation: 'reset',
        },
      })

      // Add clicked tag
      this.newSearchData({
        tag: {
          name: tag,
          operation: 'add',
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
