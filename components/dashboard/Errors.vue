<template>
  <!-- If theres request got errors -->
  <div
    v-if="
      generalData.errors !== null ||
        dashBoardData.data.count === '0' ||
        $nuxt.isOffline
    "
    class="material-container text-center p-2"
  >
    <template v-if="generalData.errors">
      <h1 v-text="generalData.errors" class="bold" />
      <a @click="getPosts()" href="javascript:void(0)">Try again?</a>
    </template>

    <template v-else-if="dashBoardData.data.count === '0'">
      <h1 v-text="'Nothing found'" class="bold" />
      <a @click="resetTags()" href="javascript:void(0)">Reset tags?</a>
    </template>
    <template v-else-if="$nuxt.isOffline">
      <h1
        v-text="'You are offline, please connect to the internet'"
        class="bold"
      />
    </template>

    <!-- Not useful -->
    <!-- <template v-else-if="!searchData.data.length">
      <h1 class="bold" v-text="'No tags found'" />
      <a href="javascript:void(0)" @click="tagManager('reset')"
        >Reset tags?</a
      >
    </template> -->
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'

export default {
  name: 'DashBoard',
  components: {},
  // Get data() from vuex stores
  computed: {
    ...mapState(['generalData', 'dashBoardData', 'searchData']),
  },
  methods: {
    ...mapActions(['getPosts', 'tagManager']),
    ...mapMutations(['newSearchData']),

    resetTags() {
      // First reset tags
      this.tagManager('reset')

      // Then show page if not active
      if (!this.searchData.isActive) {
        this.newSearchData({ isActive: this.searchData.isActive })
      }
    },
  },
}
</script>
