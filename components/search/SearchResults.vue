<template>
  <div class="material-container">
    <!-- Results -->
    <!-- ERROR HANDLING AND SEARCH RESULTS -->

    <!-- If theres errors -->
    <Errors />

    <!-- If nothing searched -->
    <h1
      v-if="!searchData.data && !generalData.errors"
      class="text-center text-default-text font-hairline m-auto text-xl"
    >Search something!</h1>

    <!-- Added tags, click them to remove them -->
    <div v-if="searchData.tags" class="tag-container border-border border-b rounded-b pb-1">
      <a
        v-for="tag in searchData.tags"
        :key="tag"
        @click="
          searchManager({
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
            searchManager({
              tag: {
                name: '-' + tag.name,
                operation: 'add',
              },
            })
          } else {
            searchManager({
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
          class="text-primary-hover group-hover:text-default"
        />
      </a>
    </div>

    <!-- Apply tags -->
    <a
      @click="dispatchGetAddedTags"
      href="#"
      class="btn theme-responsive-text text-center bg-gradient-lilac-blue mt-auto shadow-md"
    >Apply tags</a>
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
    ...mapMutations(['searchManager', 'pidManager']),
    ...mapActions(['getPosts', 'analyticManager']),
    dispatchGetAddedTags() {
      // Set PID to 0 since we're searching for new tags
      this.pidManager({ operation: 'reset' })

      // Search for the tags
      this.getPosts()

      // Hide the search bar
      this.searchManager({
        isActive: !this.searchData.isActive,
      })

      // And fire analytics
      this.analyticManager('tags')
    },
  },
}
</script>
