<template>
  <!-- If theres request got errors -->
  <div
    v-if="
      generalData.error ||
      (!dashBoardData.data.length && !isSinglePost) ||
      $nuxt.isOffline
    "
    class="material-container text-center text-default-text m-6 p-2"
  >
    <h1
      class="text-2xl font-bold tracking-wide border w-max-content mx-auto mb-1 px-2"
    >
      Error
    </h1>

    <!-- If browser is offline -->
    <template v-if="$nuxt.isOffline">
      <p>
        You are offline, please connect to the internet
      </p>
    </template>

    <!-- If ANY error -->
    <template v-else-if="generalData.error">
      <p>
        {{ generalData.error.message }}
      </p>
      <a href="#" @click="resetTags()">Remove tags?</a>
    </template>

    <!-- If no posts loaded -->
    <template v-else-if="!dashBoardData.data.length && !isSinglePost">
      <h1 class="font-bold" v-text="'There are no more posts to load!'" />
      <a href="#" @click="resetTags()">Remove tags?</a>
    </template>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'Errors',

  props: {
    // For separating text
    isSinglePost: { type: Boolean, required: false, default: false },
  },

  computed: {
    ...mapState(['generalData', 'dashBoardData', 'searchData']),
  },

  methods: {
    ...mapMutations(['searchManager', 'tagManager']),

    resetTags() {
      // console.log('Resetted tags')

      // First reset tags
      this.tagManager({ operation: 'reset' })

      // Then show page if not active
      if (!this.searchData.isActive) {
        this.searchManager({ mode: 'toggleSearch' })
      }
    },
  },
}
</script>
