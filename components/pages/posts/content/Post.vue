<template>
  <figure
    v-if="post"
    :class="{ zoom: settings.zoom.value }"
    class="text-center material-container text-default-text"
  >
    <post-media :post="post" @click.native="isActive = !isActive" />

    <figcaption class="flex flex-wrap overflow-hidden text-sm">
      <post-tags :tags="post.tags" :is-active="isActive" />

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
      isActive: false,
    }
  },

  computed: {
    ...mapState('user', ['settings']),
  },
}
</script>
