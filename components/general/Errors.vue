<template>
  <!-- If theres request got errors -->
  <div
    v-if="generalData.errors || $nuxt.isOffline || !dashBoardData.data.length"
    class="material-container text-default-text text-center p-2"
  >
    <!-- If ANY error -->
    <template v-if="generalData.errors">
      <h1 class="bold" v-text="generalData.errors" />
      <a href="javascript:void(0)" @click="getPosts('add')">Try again?</a>
    </template>

    <!-- If no posts loaded -->
    <template v-else-if="!dashBoardData.data.length">
      <h1 class="bold" v-text="'There is no more posts to load!'" />
      <a href="javascript:void(0)" @click="resetTags()">Remove tags?</a>
    </template>

    <!-- If browser is offline -->
    <template v-else-if="$nuxt.isOffline">
      <h1
        class="bold"
        v-text="'You are offline, please connect to the internet'"
      />
    </template>
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
    ...mapMutations(['searchManager', 'tagManager']),
    ...mapActions(['getPosts']),

    resetTags() {
      console.log('Resetted tags')

      // First reset tags
      this.tagManager({ operation: 'reset' })

      // Then show page if not active
      if (!this.searchData.isActive) {
        this.searchManager({ isActive: !this.searchData.isActive })
      }
    },
  },
}
</script>
