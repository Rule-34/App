<template>
  <div
    class="flex flex-col max-h-full min-h-full my-auto material-container md:min-h-2/5 md:max-h-2/5"
  >
    <div
      class="flex flex-col flex-1 max-h-full min-h-full p-2 pb-0 overflow-y-hidden"
    >
      <!-- If nothing searched -->
      <h1
        v-if="!search.searchedTags.length && !search.addedTags.length"
        class="flex items-center justify-center flex-1 text-xl font-light tracking-wide text-default-text"
      >
        Search something!
      </h1>

      <!-- Added tags, click them to remove them -->
      <div
        v-if="search.addedTags.length"
        class="mb-1 overflow-y-scroll border-b rounded tag-container border-border max-h-1/2"
      >
        <button
          v-for="tag in search.addedTags"
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
        v-if="search.searchedTags.length"
        class="flex-1 overflow-y-scroll rounded rounded-b-none tag-container"
      >
        <!-- Add tag to array of added tags -->
        <button
          v-for="tag in search.searchedTags"
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
import { mapState, mapMutations, mapActions } from 'vuex'

// JS
import { scrollToTop } from '~/assets/js/scrollUtils.js'

export default {
  name: 'SearchResults',

  computed: {
    ...mapState('booru', ['search']),
  },

  methods: {
    ...mapActions('booru', ['addedTagsManager', 'pidManager', 'fetchPosts']),
    ...mapMutations('navigation', ['setSearchActive']),

    removeAddedTag(tag) {
      this.addedTagsManager({
        operation: 'remove',
        value: tag,
      })
    },

    addToAddedTags(tag) {
      if (this.search.blacklistFilter.isActive) {
        this.addedTagsManager({
          operation: 'add',
          value: '-' + tag,
        })
      }
      //
      else {
        this.addedTagsManager({
          operation: 'add',
          value: tag,
        })
      }
    },

    async fetchAddedTags() {
      await this.pidManager({ operation: 'reset' })

      await this.setSearchActive(false)

      scrollToTop()

      this.fetchPosts()
    },
  },
}
</script>
