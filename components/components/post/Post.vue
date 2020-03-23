<template>
  <!-- Makes element zoomable if setting is enabled -->
  <figure
    :class="{ zoom: userSettings.zoom.value }"
    class="material-container text-default-text text-center"
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
import PostMedia from '~/components/components/post/PostMedia.vue'
import PostTags from '~/components/components/post/PostTags.vue'
import PostSource from '~/components/components/post/PostSource.vue'

export default {
  name: 'Post',

  components: { PostMedia, PostTags, PostSource },

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
    ...mapState(['userSettings']),
  },
}
</script>
