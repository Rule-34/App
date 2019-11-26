<template>
  <!-- Controls for navigating pages -->
  <!-- If theres errors disable controls -->
  <div
    v-if="!generalData.errors"
    :class="{ 'hover-controls-container': userSettings.hoverControls.value }"
  >
    <!-- If infinite load is NOT enabled -->
    <template v-if="!userSettings.infiniteLoad.value">
      <!-- Controls for navigating pages -->
      <div
        :class="{ 'hover-controls': userSettings.hoverControls.value }"
        class="material-container text-center p-2 flex"
      >
        <a
          @click="getPrevPage"
          href="#"
          class="w-1/3 button"
          title="Load last page"
        >
          <v-icon v-text="mdiChevronLeft" color="primary" /> Prev page
        </a>
        <a
          @click="getSpecificPage"
          v-text="dashBoardData.pid"
          href="#"
          class="w-1/3"
          title="Load specific page"
        />
        <a
          @click="getNextPage"
          href="#"
          class="w-1/3 button"
          title="Load next page"
        >
          Next page
          <v-icon v-text="mdiChevronRight" color="primary" />
        </a>
      </div>

      <!-- Add extra spacing if setting hovering control to settle in -->
      <div v-if="userSettings.hoverControls.value" class="my-6">&nbsp;</div>
    </template>
    <template v-else>
      <!-- If theres more posts -->
      <v-container v-intersect="concatPost" fluid>
        <p
          @click="concatPost"
          v-text="'Loading more posts...'"
          class="text-center text-gray-500 pb-2"
        />
        <Errors />
      </v-container>
    </template>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'

// Import icons from package
import { mdiChevronRight, mdiChevronLeft } from '@mdi/js'

export default {
  name: 'Controls',
  data() {
    return { mdiChevronRight, mdiChevronLeft }
  },
  // Map data to the store following's
  computed: {
    ...mapState(['dashBoardData', 'searchData', 'generalData', 'userSettings'])
  },

  methods: {
    // Map actions and mutations from store following's
    ...mapMutations(['newDashBoardData']),
    ...mapActions(['getPosts', 'pidManager', 'tagManager']),
    // Get next page from api
    getNextPage() {
      // Get next PID
      this.pidManager({
        operation: 'add'
      })

      // If we have tags added then load next page of tags, else load normal latest posts
      this.getPosts()
    },
    // Get last page from api
    getPrevPage() {
      // Get last PID
      this.pidManager({
        operation: 'subtract'
      })

      // Load last page
      this.getPosts()
    },
    getSpecificPage() {
      // Ask for page to go to
      const specificPage = prompt('What page do you want to go to?', '69')

      // Test if something was input
      if (!isNaN(specificPage)) {
        // Set PID to indicated
        // console.log(specificPage);
        this.newDashBoardData({
          pid: specificPage
        })

        // And load specific page
        this.getPosts()
      } else {
        alert('Wrong input, only numbers please')
      }
    }
  }
}
</script>
