<template>
  <div v-if="tags.length" class="w-full overflow-hidden">
    <TransitionCollapse>
      <div v-if="isActive">
        <!-- Workaround for this not jumping is having a div before -->
        <div class="min-w-full tag-container">
          <button
            v-for="tag in tags"
            :key="tag"
            type="button"
            class="tag color-util"
            @click="getSpecificTag(tag)"
            v-text="tag"
          />
        </div>
      </div>
    </TransitionCollapse>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'

// Components
import TransitionCollapse from '~/components/utils/TransitionCollapse.vue'

// JS
import { scrollToTop } from '~/assets/js/scrollUtils.js'

export default {
  name: 'PostTags',

  components: { TransitionCollapse },

  props: {
    tags: {
      type: Array,
      default() {
        return undefined
      },
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    ...mapMutations(['pidManager', 'tagManager']),
    ...mapActions(['fetchWithMode']),

    async getSpecificTag(tag) {
      this.pidManager({ operation: 'reset' })

      this.tagManager({
        operation: 'reset',
      })

      this.tagManager({
        operation: 'add',
        tag: {
          name: tag,
        },
      })

      scrollToTop()

      // Search for the tag
      await this.fetchWithMode({ mode: 'posts', returnMode: 'add' })
    },
  },
}
</script>
