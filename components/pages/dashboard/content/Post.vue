<template>
  <!-- Makes element zoomable if setting is enabled -->
  <figure
    v-if="post"
    :class="{ zoom: settings.zoom.value }"
    class="text-center material-container text-default-text"
  >
    <!-- Media -->
    <post-media :post="post" @click.native="isActive = !isActive" />

    <!-- Tags -->
    <figcaption class="flex flex-wrap overflow-hidden text-sm">
      <post-tags :tags="post.tags" :is-active="isActive" />

      <!-- Source -->
      <post-source :source="post.source" />
    </figcaption>
  </figure>
</template>

<script>
import { mapState } from 'vuex'
// Components
import PostMedia from './PostMedia.vue'
import PostTags from './PostTags.vue'
import PostSource from './PostSource.vue'

export default {
  name: 'Post',

  components: { PostMedia, PostTags, PostSource },

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
      // Internal toggle for showing tags
      isActive: false,
    }
  },

  computed: {
    ...mapState('user', ['settings']),
  },
}
</script>
