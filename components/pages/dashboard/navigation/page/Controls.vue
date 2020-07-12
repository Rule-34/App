<template>
  <div>
    <!-- Normal controls -->
    <div
      v-if="!settings.infiniteLoad.value"
      :class="{ 'hover-controls-container': settings.hoverControls.value }"
    >
      <div
        :class="{ 'hover-controls': settings.hoverControls.value }"
        class="flex p-2 text-center material-container"
      >
        <!-- Get previous page -->
        <div
          class="w-1/3 color-util"
          title="Load previous page"
          @click="getPrevPage()"
        >
          <button type="button">
            <ArrowLeftIcon class="inline w-4 h-4 icon" />
            Prev page
          </button>
        </div>

        <!-- Get specific page -->
        <div
          class="w-1/3 color-util"
          title="Load specific page"
          @click="getSpecificPage()"
        >
          <button type="button" v-text="queries.pid" />
        </div>

        <!-- Get next page -->
        <div
          class="w-1/3 color-util"
          title="Load next page"
          @click="getNextPage()"
        >
          <button type="button">
            Next page
            <ArrowRightIcon class="inline w-4 h-4 icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- Infinite loading -->
    <div v-else v-intersect.quiet="InfiniteLoadHandler" class="mx-auto">
      <p class="pb-2 text-center text-default-text">
        Loading more posts...
      </p>
    </div>

    <!-- Space below all posts -->
    <div v-if="settings.hoverControls.value" class="mb-6">&nbsp;</div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

// Third party
import { Intersect } from 'vuetify/lib/directives/intersect'
import throttle from 'lodash/throttle'

// Icons
import { ArrowLeftIcon, ArrowRightIcon } from 'vue-feather-icons'

// Components
import KeyboardNavigationMixin from '~/components/pages/dashboard/navigation/page/KeyboardNavigationMixin.js'

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

  mixins: [KeyboardNavigationMixin],

  computed: {
    ...mapState('booru', ['queries']),
    ...mapState('user', ['settings']),
  },

  methods: {
    ...mapActions('booru', ['fetchPosts', 'pidManager']),

    getNextPage() {
      this.pidManager({ operation: 'add' })

      if (!this.settings.infiniteLoad.value) scrollToTop()

      this.fetchPosts()
    },

    getPrevPage() {
      this.pidManager({ operation: 'subtract' })

      if (!this.settings.infiniteLoad.value) scrollToTop()

      this.fetchPosts()
    },

    getSpecificPage() {
      const specificPage = Number.parseInt(
        prompt('What page do you want to go to?', '69')
      )

      if (!specificPage) {
        alert('Wrong input, only numbers please')
        return
      }

      this.pidManager({ operation: 'set', value: specificPage })

      if (!this.settings.infiniteLoad.value) scrollToTop()

      this.fetchPosts()
    },

    InfiniteLoadHandler: throttle(function () {
      console.debug('Loading more posts')
      this.pidManager({ operation: 'add' })

      this.fetchPosts({ mode: 'concat' })
    }, 5000),
  },
}
</script>
<style lang="postcss">
/* HOVER CONTROLS SETTING */

.hover-controls-container {
  @apply fixed bottom-0 inset-x-0 z-10 w-full mx-auto p-2;
}

.hover-controls {
  @apply shadow-md mx-auto my-0;
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
