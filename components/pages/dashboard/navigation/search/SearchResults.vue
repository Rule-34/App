<template>
  <div
    class="flex flex-col max-h-full min-h-full my-auto material-container md:min-h-2/5 md:max-h-2/5"
  >
    <div
      class="flex flex-col flex-1 max-h-full min-h-full p-2 pb-0 overflow-y-hidden"
    >
      <!-- If theres errors -->
      <Errors />

      <!-- If nothing searched -->
      <h1
        v-if="
          !searchData.data.length &&
          !searchData.tags.length &&
          !generalData.error
        "
        class="flex-1 flex items-center justify-center text-default-text text-xl font-light tracking-wide"
      >
        Search something!
      </h1>

      <!-- Added tags, click them to remove them -->
      <div
        v-if="searchData.tags.length"
        class="tag-container border-b border-border rounded mb-1 overflow-y-scroll max-h-1/2"
      >
        <button
          v-for="tag in searchData.tags"
          :key="tag"
          type="button"
          class="tag color-util"
          @click="removeTagFromActive(tag)"
        >
          {{ tag }}
        </button>
      </div>

      <!-- Searched tags, click them to add them -->
      <div
        v-if="searchData.data.length"
        class="flex-1 tag-container rounded rounded-b-none overflow-y-scroll"
      >
        <!-- Add tag to array of added tags, if filter is active then append '-' -->
        <button
          v-for="tag in searchData.data"
          :key="tag.name"
          type="button"
          class="tag color-util group"
          @click="addTagToActiveTags(tag.name)"
        >
          <!-- Name of the tag -->
          <span>
            {{ tag.name }}
          </span>

          <!-- Number of posts with that tag -->
          <span
            class="text-primary-hover group-hover:text-default transition--color"
            >{{ `(${tag.count})` }}
          </span>
        </button>
      </div>
    </div>

    <!-- Apply tags button -->
    <button
      class="w-full text-center text-lg font-bold tracking-wide text-default-text bg-gradient-lilac-blue py-2 px-4 shadow-md"
      type="submit"
      @click.prevent="dispatchGetAddedTags()"
    >
      Apply tags
    </button>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import Errors from '~/components/utils/Errors.vue'

// JS
import { scrollToTop } from '~/assets/js/scrollUtils.js'

export default {
  name: 'SearchResults',

  components: { Errors },

  computed: {
    ...mapState(['searchData', 'generalData']),
  },

  methods: {
    ...mapActions(['fetchWithMode']),
    ...mapMutations(['pidManager', 'tagManager']),
    ...mapMutations('navigation', ['setSearchActive']),

    removeTagFromActive(tagName) {
      this.tagManager({
        operation: 'remove',
        tag: {
          name: tagName,
        },
      })
    },

    addTagToActiveTags(tagName) {
      if (this.searchData.isFilterActive) {
        this.tagManager({
          operation: 'add',
          tag: {
            name: '-' + tagName,
          },
        })
      } else {
        this.tagManager({
          operation: 'add',
          tag: {
            name: tagName,
          },
        })
      }
    },

    async dispatchGetAddedTags() {
      await this.pidManager({ operation: 'reset' })

      this.setSearchActive(false)
      await this.setSearchActive(false)

      scrollToTop()

      await this.fetchWithMode({ mode: 'posts', returnMode: 'add' })
    },
  },
}
</script>
