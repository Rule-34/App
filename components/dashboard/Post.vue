<template>
  <!-- Loop for every post -->
  <div class="material-container" :class="{ zoom: userSettings.zoom.value }">
    <!-- TODO: style="max-height: 80vh;" TODO: good for image previews -->
    <!-- if Image -->
    <template v-if="post.type === 'image'">
      <!-- If lazy loading enabled -->
      <template v-if="userSettings.lazyLoading.value">
        <!-- If image in full size -->
        <template v-if="userSettings.fullSizeImages.value">
          <img
            v-lazy="post.file_url"
            class="post-img"
            :alt="post.type"
            :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
            @click="toggleTags"
          />
        </template>
        <!-- If image NOT in full size -->
        <template v-else>
          <img
            v-lazy="post.sample_url"
            class="post-img"
            :alt="post.type"
            :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
            @click="toggleTags"
          />
        </template>
      </template>

      <!-- If lazy loading disabled -->
      <template v-else>
        <!-- If image in full size -->
        <template v-if="userSettings.fullSizeImages.value">
          <img
            :src="post.file_url"
            class="post-img"
            :alt="post.type"
            :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
            @click="toggleTags"
          />
        </template>
        <!-- If image NOT in full size -->
        <template v-else>
          <img
            :src="post.sample_url"
            class="post-img"
            :alt="post.type"
            :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
            @click="toggleTags"
          />
        </template>
      </template>
    </template>
    <!-- :style="{ height: post.height + 'px', width: post.width + 'px' }" -->

    <!-- if Video -->
    <template v-else-if="post.type === 'video'">
      <!-- If lazy loading enabled -->
      <template v-if="userSettings.lazyLoading.value">
        <lazy-component>
          <video
            class="post-img"
            :alt="post.type"
            :controls="userSettings.videoControls.value"
            autoplay
            muted
            loop
            :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
            @click="toggleTags"
          >
            <source :src="post.file_url" />
            Your browser doesnt support HTML5 video.
          </video>
        </lazy-component>
      </template>
      <template v-else>
        <video
          class="post-img"
          :alt="post.type"
          :controls="userSettings.videoControls.value"
          autoplay
          muted
          loop
          :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
          @click="toggleTags"
        >
          <source :src="post.file_url" />
          Your browser doesnt support HTML5 video.
        </video>
      </template>
    </template>

    <!-- if Anything else -->
    <template v-else> Unknown type of media: {{ post.type }} </template>

    <!-- Tags and source -->
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
            v-if="post.tags && isActive"
            key="tags"
            class="w-full tag-container"
          >
            <a
              v-for="tag in post.tags"
              :key="post[tag]"
              class="tag"
              href="#"
              @click="getSpecificTag(tag)"
              v-text="tag"
            />
          </div>

          <!-- Source -->
          <div
            v-if="post.source"
            key="source"
            class="w-full m-auto text-center"
          >
            <template v-if="isUrl()">
              <a
                class="inline-flex items-baseline"
                :href="post.source"
                rel="noreferrer noopener nofollow"
                target="_blank"
              >
                <p>Source</p>
                <ExternalLinkIcon class="icon ml-2 text-black w-4 h-4" />
              </a>
            </template>

            <template v-else>
              <p title="Source" v-text="post.source" />
            </template>
          </div>
        </transition-group>
      </div>
      <!-- </div> -->
    </transition>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { ExternalLinkIcon } from "vue-feather-icons";

export default {
  name: "Post",
  components: { ExternalLinkIcon },
  props: {
    postData: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      // Save data so we can use
      post: this.postData,
      // Internal toggle for showing tags
      isActive: false
    };
  },
  computed: mapState(["searchData", "userSettings"]),
  methods: {
    ...mapMutations(["newSearchData"]),
    ...mapActions(["pidManager", "tagManager", "getPosts", "analytics"]),
    // Check if its an url
    isUrl() {
      if (this.post.source.startsWith("http", "www")) {
        // console.log("its a url", this.post.source);
        return true;
      } else {
        // console.log("Not a url", this.post.source);
        return false;
      }
    },
    // Toggle showing tags on click
    toggleTags() {
      this.isActive = !this.isActive;
    },
    getSpecificTag(tag) {
      // Set PID to 0 since we're searching for new tags
      this.pidManager({
        function: "reset"
      });

      // Reset all tags
      this.newSearchData({
        tag: {
          function: "reset"
        }
      });

      // Add clicked tag
      this.newSearchData({
        tag: {
          name: tag,
          function: "add"
        }
      });

      // Search for the tag
      this.getPosts();

      // And fire analytics
      this.analytics("tags");
    }
  }
};
</script>
