<template>
  <!-- Controls for navigating pages -->
  <div
    :class="{ 'hover-controls-container': userSettings.hoverControls.value }"
  >
    <div
      v-if="!generalData.errors && dashBoardData"
      :class="{ 'hover-controls': userSettings.hoverControls.value }"
      class="material-container text-center p-2 flex"
    >
      <a
        href="#"
        @click="getPrevPage"
        class="w-1/3 button"
        title="Load last page"
      >
        <ArrowLeftIcon class="icon w-4 h-4 inline" /> Prev page
      </a>
      <a
        href="#"
        @click="getSpecificPage"
        class="w-1/3"
        v-text="dashBoardData.pid"
        title="Load specific page"
      />
      <a
        href="#"
        @click="getNextPage"
        class="w-1/3 button"
        title="Load next page"
      >
        Next page
        <ArrowRightIcon class="icon w-4 h-4 inline" />
      </a>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'

// Import icons from package
import { ArrowLeftIcon, ArrowRightIcon } from 'vue-feather-icons'

export default {
  name: 'Controls',
  components: {
    ArrowRightIcon,
    ArrowLeftIcon,
  },
  // Map data to the store following's
  computed: {
    ...mapState(['dashBoardData', 'searchData', 'generalData', 'userSettings']),
  },

  methods: {
    // Map actions and mutations from store following's
    ...mapMutations(['newDashBoardData']),
    ...mapActions(['getPosts', 'pidManager']),
    // Get next page from api
    getNextPage() {
      // Get next PID
      this.pidManager({
        operation: 'add',
      })

      // If we have tags added then load next page of tags, else load normal latest posts
      this.getPosts()
    },
    // Get last page from api
    getPrevPage() {
      // Get last PID
      this.pidManager({
        operation: 'subtract',
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
          pid: specificPage,
        })

        // And load specific page
        this.getPosts()
      } else {
        alert('Wrong input, only numbers please')
      }
    },
  },
}
</script>
