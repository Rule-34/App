<template>
  <div class="material-container search-results--grid flex">
    <!-- If theres errors -->
    <Errors />

    <!-- If nothing searched -->
    <div
      v-if="!searchData.tags.length && !generalData.errors"
      class="flex-1 flex min-h-full"
    >
      <h1
        class="text-center text-default-text text-xl font-hairline tracking-wide m-auto"
      >
        Search something!
      </h1>
    </div>

    <!-- Added tags, click them to remove them -->
    <div
      v-if="searchData.tags.length"
      class="tag-container border-border border-b rounded pb-1"
    >
      <a
        v-for="tag in searchData.tags"
        :key="tag"
        class="tag"
        @click="removeTagFromActive(tag)"
        v-text="tag"
      />
    </div>

    <!-- Searched tags, click them to add them -->
    <div
      v-if="searchData.data.length"
      class="tag-container my-1 border-border border-b rounded"
    >
      <!-- Add tag to array of added tags, if filter is active then append '-' -->
      <a
        v-for="tag in searchData.data"
        :key="tag.name"
        class="tag group"
        @click="addTagToActiveTags(tag.name)"
      >
        <!-- Name of the tag -->
        <span v-text="tag.name" />

        <!-- Number of posts with that tag -->
        <span
          class="text-primary-hover group-hover:text-default transition--color"
          v-text="`(${tag.count})`"
        />
      </a>
    </div>

    <!-- Apply tags -->
    <div class="flex min-h-full flex-1">
      <a href="#" class="mt-auto w-full">
        <button
          class="text-center w-full text-default-text font-bold border-0 rounded bg-gradient-lilac-blue py-2 px-4 shadow-md"
          type="button"
          @click="dispatchGetAddedTags()"
        >
          Apply tags
        </button>
      </a>
    </div>
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
    ...mapState(['searchData', 'generalData'])
  },

  methods: {
    ...mapMutations(['searchManager', 'pidManager', 'tagManager']),
    ...mapActions(['fetchWithMode', 'analyticManager']),

    removeTagFromActive(tagName) {
      this.tagManager({
        operation: 'remove',
        tag: {
          name: tagName
        }
      })
    },

    // Add tag to actives
    addTagToActiveTags(tagName) {
      // If filtering out tags is active
      if (this.searchData.isFilterActive) {
        this.tagManager({
          operation: 'add',
          tag: {
            name: '-' + tagName
          }
        })
      } else {
        this.tagManager({
          operation: 'add',
          tag: {
            name: tagName
          }
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
        mode: 'toggleSearch'
      })

      // And fire analytics
      this.analyticManager('tags')
    }
  }
}
</script>

<style>
/* .search-results--grid {
  display: grid;
  grid-template-rows: auto auto auto 1fr;
} */
</style>
