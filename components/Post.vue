<template>
  <!-- Loop for every post -->
  <div class="post-container">
    <!-- style="max-height: 80vh;" TODO: good for image previews -->
    <!-- Image -->
    <img
      v-if="post.type === 'image'"
      v-lazy="post.file_url"
      class="post-img"
      :alt="post.type"
      @click="toggleTags"
    />
    <!-- :style="{height: post.height + 'px'}" -->

    <!-- Video -->
    <lazy-component v-if="post.type == 'video'" @click="toggleTags">
      <video class="post-img" :alt="post.type" controls autoplay muted loop>
        <!-- prettier-ignore -->
        <source :src="post.file_url">
        Your browser doesnt support HTML5 video.
      </video>
    </lazy-component>

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
        class="post-extra w-full md:w-11/12 tag-container"
        :class="{ 'md:w-full': !post.source }"
      >
        <a
          v-for="tag in post.tags"
          :key="post[tag]"
          class="tag"
          href="javascript:void(0)"
          v-text="tag"
        />
      </div>
      <!-- Source -->
      <div v-if="post.source" class="w-full md:w-1/12 md:m-auto text-center">
        <a
          class="inline-flex items-baseline"
          :href="post.source"
          rel="noreferrer noopener nofollow"
          target="_blank"
        >
          <p>Source</p>
          <external-link-icon class="icon ml-2 text-black w-4 h-4" />
        </a>
      </div>
    </div>
    <!-- </div> -->
  </div>
</template>

<script>
import { ExternalLinkIcon } from 'vue-feather-icons'

export default {
  name: 'Post',
  components: { ExternalLinkIcon },
  props: { postData: Object },
  data() {
    return {
      post: this.postData,
      isActive: false
    }
  },
  methods: {
    toggleTags() {
      if (this.isActive) {
        this.isActive = false
        return ''
      } else if (!this.isActive) {
        this.isActive = true
        return ''
      }
    }
  }
}
</script>
