<template>
  <div>
    <!-- Results -->
    <!-- ERROR HANDLING AND SEARCH RESULTS -->

    <!-- If theres errors -->
    <Errors />

    <!-- If nothing searched -->
    <h1
      v-if="!searchData.data && !generalData.errors"
      class="text-center font-hairline m-auto text-xl"
    >
      Search something!
    </h1>

    <!-- Added tags, click them to remove them -->
    <div v-if="searchData.tags" class="tag-container border-b rounded-b pb-1">
      <a
        v-for="tag in searchData.tags"
        :key="tag"
        @click="
          newSearchData({
            tag: {
              name: tag,
              operation: 'remove',
            },
          })
        "
        v-text="tag"
        class="tag group"
      />
    </div>

    <!-- Tags, click them to add them -->
    <div v-if="searchData.data" class="tag-container mt-1">
      <!-- Add tag to array of added tags, if filter is active then append '-' -->
      <a
        v-for="tag in searchData.data"
        :key="tag.name"
        @click="
          if (searchData.isFilterActive) {
            newSearchData({
              tag: {
                name: '-' + tag.name,
                operation: 'add',
              },
            })
          } else {
            newSearchData({
              tag: {
                name: tag.name,
                operation: 'add',
              },
            })
          }
        "
        class="tag group"
      >
        {{ tag.name }}
        <span
          v-text="'(' + tag.posts + ')'"
          class="text-gray-400 group-hover:text-gray-600"
        />
      </a>
    </div>

    <!-- Apply tags -->
    <a
      @click="dispatchGetAddedTags"
      href="#"
      class="btn text-white text-center bg-gradient-lilac-blue mt-auto shadow-md"
    >
      Apply tags
    </a>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import Errors from './Errors.vue'

export default {
  name: 'SearchResults',
  components: { Errors },
  // Get data() from vuex store "searchData"
  computed: {
    ...mapState(['searchData', 'generalData']),
  },
  methods: {
    ...mapMutations(['newSearchData']),
    ...mapActions(['pidManager', 'getPosts', 'analytics']),
    dispatchGetAddedTags() {
      // Set PID to 0 since we're searching for new tags
      this.pidManager({
        operation: 'reset',
      })

      // Search for the tags
      this.getPosts()

      // Hide the search bar
      this.newSearchData({
        isActive: !this.searchData.isActive,
      })

      // And fire analytics
      this.analytics('tags')
    },
  },
}
</script>
