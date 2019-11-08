<template>
  <!-- Loop for every post -->
  <div class="material-container" :class="{ zoom: userSettings.zoom.value }">
    <!-- style="max-height: 80vh;" TODO: good for image previews -->
    <!-- Image -->
    <template v-if="post.type === 'image'">
      <template v-if="userSettings.fullSizeImages.value">
        <img
          v-lazy="post.file_url"
          class="post-img"
          :alt="post.type"
          :class="{ 'nsfw-disabled': !userSettings.nsfw.value }"
          @click="toggleTags"
        />
      </template>
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
    <!-- :style="{ height: post.height + 'px', width: post.width + 'px' }" -->
    <template v-else>
      <lazy-component>
        <video
          class="post-img"
          :alt="post.type"
          controls
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
    <!-- Video -->

    <!-- Details like comments, tags and source TODO: Maybe add p-4 again -->
    <!-- <div class="p-2"> -->
    <!-- Loop if the post has comment -->
    <!-- <div class="card-post-comments" v-if="post.has_comments">
            <div v-for="comment in comments" :key="comment.id">
              // TODO
              <div class="card-comment">
                <h5 class="card-comment-user" v-text="comment.creator"></h5>
                <h4 class="card-comment-text" v-text="comment.body"></h4>
              </div>
            </div>
      </div>-->
    <!-- Tags and source -->
    <div
      v-if="post.source || (post.tags && isActive)"
      class="flex flex-wrap overflow-hidden text-sm p-1"
    >
      <!-- Tags -->
      <div
        v-if="post.tags && isActive"
        class="post-extra w-full md:w-10/12 tag-container"
        :class="{ 'md:w-full': !post.source }"
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
      <div v-if="post.source" class="w-full md:w-2/12 md:m-auto text-center">
        <a
          class="inline-flex items-baseline"
          :href="post.source"
          rel="noreferrer noopener nofollow"
          target="_blank"
        >
          <p>Source</p>
          <ExternalLinkIcon class="icon ml-2 text-black w-4 h-4" />
        </a>
      </div>
    </div>
    <!-- </div> -->
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
  computed: mapState(["userSettings"]),
  methods: {
    ...mapMutations(["newSearchData"]),
    ...mapActions(["changePID", "getAddedTags"]),
    // Toggle showing tags on click
    toggleTags() {
      if (this.isActive) {
        this.isActive = false;
      } else if (!this.isActive) {
        this.isActive = true;
      }
    },
    getSpecificTag(tag) {
      // Set PID to 0 since we're searching for new tags
      this.changePID({
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
      this.getAddedTags();
    }
  }
};
</script>
