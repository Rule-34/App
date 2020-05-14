<template>
  <!-- Controls for navigating pages -->
  <div
    v-if="!generalData.error"
    :class="{ 'hover-controls-container': userSettings.hoverControls.value }"
  >
    <div
      :class="{ 'hover-controls': userSettings.hoverControls.value }"
      class="material-container flex text-center p-2"
    >
      <!-- Get previous page -->
      <a href="#" class="w-1/3" title="Load last page" @click="getPrevPage">
        <button type="button">
          <ArrowLeftIcon class="icon w-4 h-4 inline" />Prev page
        </button>
      </a>

      <!-- Get specific page -->
      <a
        href="#"
        class="w-1/3"
        title="Load specific page"
        @click="getSpecificPage"
      >
        <button type="button" v-text="booruData.active.pid" />
      </a>

      <!-- Get next page -->
      <a href="#" class="w-1/3" title="Load next page" @click="getNextPage">
        <button type="button">
          Next page
          <ArrowRightIcon class="icon w-4 h-4 inline" />
        </button>
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
    ...mapState(['booruData', 'generalData', 'userSettings']),
  },

  methods: {
    // Map actions and mutations from store following's
    ...mapMutations(['pidManager']),
    ...mapActions(['fetchWithMode']),

    // Get next page from api
    async getNextPage() {
      // Get next PID
      this.pidManager({ operation: 'add' })

      // If we have tags added then load next page of tags, else load normal latest posts

      await this.fetchWithMode({ mode: 'posts', returnMode: 'add' })
    },

    // Get last page from api
    async getPrevPage() {
      // Get last PID
      this.pidManager({ operation: 'subtract' })

      // Load last page

      await this.fetchWithMode({ mode: 'posts', returnMode: 'add' })
    },

    async getSpecificPage() {
      // Ask for page to go to
      const specificPage = Number.parseInt(
        prompt('What page do you want to go to?', '69')
      )

      // console.log(specificPage)
      // console.log(Number.isInteger(specificPage))

      // Test if something was input
      if (specificPage) {
        // Set PID to indicated
        this.pidManager({ operation: 'specific', value: specificPage })

        // And load specific page

        await this.fetchWithMode({ mode: 'posts', returnMode: 'add' })
      } else {
        alert('Wrong input, only numbers please')
      }
    },
  },
}
</script>
