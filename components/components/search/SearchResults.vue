<template>
  <div class="material-container flex flex-col my-auto min-h-full md:min-h-1/4">
    <!-- Content -->
    <div class="flex-1 flex flex-col p-2">
      <!-- If theres errors -->
      <Errors />

      <!-- If nothing searched -->
      <h1
        v-if="
          !searchData.data.length &&
          !searchData.tags.length &&
          !generalData.errors
        "
        class="flex-1 flex items-center justify-center text-default-text text-xl font-hairline tracking-wide"
      >
        Search something!
      </h1>

      <!-- Added tags, click them to remove them -->
      <div
        v-if="searchData.tags.length"
        class="tag-container border-b border-border rounded mb-1"
      >
        <a
          v-for="tag in searchData.tags"
          :key="tag"
          class="tag"
          @click="removeTagFromActive(tag)"
          >{{ tag }}</a
        >
      </div>

      <!-- Searched tags, click them to add them -->
      <div
        v-if="searchData.data.length"
        class="tag-container border-b border-border rounded"
      >
        <!-- Add tag to array of added tags, if filter is active then append '-' -->
        <a
          v-for="tag in searchData.data"
          :key="tag.name"
          class="tag group"
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
        </a>
      </div>
    </div>

    <!-- Apply tags button -->
    <button
      class="text-center w-full text-default-text font-bold bg-gradient-lilac-blue py-2 px-4 shadow-md"
      type="submit"
      @click.prevent="dispatchGetAddedTags()"
    >
      Apply tags
    </button>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import Errors from '~/components/general/Errors'

export default {
  name: 'SearchResults',

  components: { Errors },

  // Get data() from vuex store "searchData"
  computed: {
    ...mapState(['searchData', 'generalData']),
  },

  methods: {
    ...mapMutations(['searchManager', 'pidManager', 'tagManager']),
    ...mapActions(['fetchWithMode', 'analyticManager']),

    removeTagFromActive(tagName) {
      this.tagManager({
        operation: 'remove',
        tag: {
          name: tagName,
        },
      })
    },

    // Add tag to actives
    addTagToActiveTags(tagName) {
      // If filtering out tags is active
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

    dispatchGetAddedTags() {
      // Set PID to 0 since we're searching for new tags
      this.pidManager({ operation: 'reset' })

      // Search for the tags
      this.fetchWithMode({ mode: 'posts', returnMode: 'add' })

      // Hide the search bar
      this.searchManager({
        mode: 'toggleSearch',
      })

      // And fire analytics
      this.analyticManager('tags')

      // And scroll to top
      window.scrollTo(0, 0)
    },
  },
}
</script>
