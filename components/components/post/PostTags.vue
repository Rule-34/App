<template>
  <!-- Tags -->
  <!-- Only show them if they exist -->
  <div
    v-if="tags.length"
    ref="postTags"
    class="tags--transition min-w-full overflow-hidden"
    :style="
      isActive
        ? `max-height: ${$refs.postTags.scrollHeight}px; opacity: 1;`
        : 'max-height: 0px; opacity: 0;'
    "
  >
    <!-- Workaround for this not jumping is applying collapse to the div before div with padding/margin -->
    <div class="tag-container min-w-full">
      <a
        v-for="tag in tags"
        :key="tags[tag]"
        class="tag"
        href="#"
        @click="getSpecificTag(tag)"
        v-text="tag"
      />
    </div>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'

export default {
  name: 'PostTags',

  props: {
    tags: {
      type: Array,
      default() {
        return []
      },
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    ...mapMutations(['pidManager', 'tagManager']),
    ...mapActions(['fetchWithMode', 'analyticManager']),

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

      this.fetchWithMode({ mode: 'posts', returnMode: 'add' })

      // And fire analytics
      this.analyticManager('tags')
    },
  },
}
</script>

<style>
/* Transition for tags */
.tags--transition {
  transition-duration: 0.35s;
  transition-timing-function: ease;
  transition-property: opacity, max-height;
}
</style>
