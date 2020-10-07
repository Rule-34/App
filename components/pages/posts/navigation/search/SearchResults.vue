<template>
  <div
    class="flex flex-col max-h-full min-h-full my-auto material-container md:min-h-2/5 md:max-h-2/5"
  >
    <div
      class="flex flex-col flex-1 max-h-full min-h-full p-2 pb-0 overflow-y-hidden"
    >
      <!-- If nothing searched -->
      <h1
        v-if="!getSearchSearchedTags.length && !getSearchAddedTags.length"
        class="flex items-center justify-center flex-1 text-xl font-light tracking-wide text-default-text"
      >
        Search something!
      </h1>

      <!-- Added tags, click them to remove them -->
      <div
        v-show="getSearchAddedTags.length"
        class="mb-1 overflow-y-scroll border-b rounded tag-container border-border max-h-1/2"
      >
        <button
          v-for="tag in getSearchAddedTags"
          :key="tag"
          type="button"
          class="tag color-util"
          @click="removeAddedTag(tag)"
        >
          {{ tag }}
        </button>
      </div>

      <!-- Searched tags, click them to add them -->
      <div
        v-show="getSearchSearchedTags.length"
        class="flex-1 overflow-y-scroll rounded rounded-b-none tag-container"
      >
        <!-- Add tag to array of added tags -->
        <button
          v-for="tag in getSearchSearchedTags"
          :key="tag.name"
          type="button"
          class="tag color-util group"
          @click="addToAddedTags(tag.name)"
        >
          <!-- Name of the tag -->
          <span>
            {{ tag.name }}
          </span>

          <!-- Number of posts with that tag -->
          <span
            class="transition-colors duration-300 text-primary-hover group-hover:text-default"
            >{{ `(${tag.count})` }}
          </span>
        </button>
      </div>
    </div>

    <!-- Apply tags button -->
    <button
      class="w-full px-4 py-2 text-lg font-bold tracking-wide text-center shadow-md text-default-text bg-gradient-lilac-blue"
      type="submit"
      @click.prevent="fetchAddedTags()"
    >
      Apply tags
    </button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

// JS
import { scrollToTop } from '~/assets/js/scrollUtils.js'

export default {
  computed: {
    ...mapGetters('booru', ['getSearchAddedTags', 'getSearchSearchedTags']),
    ...mapGetters('navigation', ['isNegativeTagsActive']),
  },

  methods: {
    ...mapActions('booru', ['addedTagsManager', 'pidManager', 'fetchPosts']),
    ...mapActions('navigation', ['searchNavigationManager']),

    removeAddedTag(tag) {
      this.addedTagsManager({
        operation: 'remove',
        value: tag,
      })
    },

    addToAddedTags(tag) {
      const prefix = this.isNegativeTagsActive ? '-' : ''

      this.addedTagsManager({
        operation: 'add',
        value: prefix + tag,
      })
    },

    fetchAddedTags() {
      this.pidManager({ operation: 'reset' })

      this.searchNavigationManager({ operation: 'set', value: false })

      scrollToTop()

      this.fetchPosts()
    },
  },
}
</script>
