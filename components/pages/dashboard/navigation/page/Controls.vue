<template>
  <div>
    <!-- Normal controls -->
    <div
      v-if="!userSettings.infiniteLoad.value"
      :class="{ 'hover-controls-container': userSettings.hoverControls.value }"
    >
      <div
        :class="{ 'hover-controls': userSettings.hoverControls.value }"
        class="material-container flex text-center p-2"
      >
        <!-- Get previous page -->
        <div
          class="w-1/3 color-util"
          title="Load previous page"
          @click="getPrevPage"
        >
          <button type="button">
            <ArrowLeftIcon class="icon w-4 h-4 inline" />
            Prev page
          </button>
        </div>

        <!-- Get specific page -->
        <div
          class="w-1/3 color-util"
          title="Load specific page"
          @click="getSpecificPage"
        >
          <button type="button" v-text="dashBoardData.pid" />
        </div>

        <!-- Get next page -->
        <div
          class="w-1/3 color-util"
          title="Load next page"
          @click="getNextPage"
        >
          <button type="button">
            Next page
            <ArrowRightIcon class="icon w-4 h-4 inline" />
          </button>
        </div>
      </div>
    </div>

    <!-- Infinite loading -->
    <div v-else v-intersect.quiet="InfiniteLoadHandler" class="mx-auto">
      <p class="text-center text-default-text pb-2">
        Loading more posts...
      </p>
    </div>

    <!-- Space below all posts -->
    <div v-if="userSettings.hoverControls.value" class="mb-12">&nbsp;</div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'

// Third party
import { Intersect } from 'vuetify/lib/directives/intersect'
import throttle from 'lodash/throttle'

// Icons
import { ArrowLeftIcon, ArrowRightIcon } from 'vue-feather-icons'

// JS
import { scrollToTop } from '~/assets/js/scrollUtils.js'

export default {
  name: 'Controls',

  components: {
    ArrowRightIcon,
    ArrowLeftIcon,
  },

  directives: {
    Intersect,
  },

  computed: {
    ...mapState(['dashBoardData', 'userSettings']),
  },

  mounted() {
    // Navigation with keyboard
    if (this.userSettings.keyboardControls.value) {
      document.addEventListener('keyup', this.keyboardPageHandler)
    }
  },

  destroyed() {
    // Navigation with keyboard
    if (this.userSettings.keyboardControls.value) {
      document.removeEventListener('keyup', this.keyboardPageHandler)
    }
  },

  methods: {
    ...mapMutations(['pidManager']),
    ...mapActions(['fetchWithMode']),

    // Get next page from API
    async getNextPage() {
      this.pidManager({ operation: 'add' })

      if (!this.userSettings.infiniteLoad.value) scrollToTop()

      await this.fetchWithMode({ mode: 'posts', returnMode: 'add' })
    },

    // Get last page from API
    async getPrevPage() {
      this.pidManager({ operation: 'subtract' })

      if (!this.userSettings.infiniteLoad.value) scrollToTop()

      await this.fetchWithMode({ mode: 'posts', returnMode: 'add' })
    },

    async getSpecificPage() {
      const specificPage = Number.parseInt(
        prompt('What page do you want to go to?', '69')
      )

      // console.log(specificPage)
      // console.log(Number.isInteger(specificPage))

      if (!specificPage) {
        alert('Wrong input, only numbers please')
        return
      }

      this.pidManager({ operation: 'specific', value: specificPage })

      await this.fetchWithMode({ mode: 'posts', returnMode: 'add' })

      if (!this.userSettings.infiniteLoad.value) scrollToTop()
    },

    InfiniteLoadHandler: throttle(async function () {
      console.debug('Loading more posts')
      this.pidManager({ operation: 'add' })

      await this.fetchWithMode({ mode: 'posts', returnMode: 'concat' })
    }, 5000),

    keyboardPageHandler() {
      switch (event.keyCode) {
        case 39:
          this.getNextPage()

          console.debug('Loading next page')
          break

        case 37:
          this.getPrevPage()

          console.debug('Loading prev page')
          break
      }
    },
  },
}
</script>
<style lang="postcss">
/* HOVER CONTROLS SETTING */

.hover-controls-container {
  @apply fixed bottom-0 inset-x-0 z-10 w-full mx-auto p-2;
}

.hover-controls {
  @apply shadow-md mx-auto mb-2;
}

@screen md {
  .hover-controls-container {
    @apply w-2/3;
  }
}
@screen xl {
  .hover-controls-container {
    @apply w-1/2;
  }
}
</style>
