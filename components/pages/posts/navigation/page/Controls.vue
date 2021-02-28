<template>
  <div>
    <!-- Normal controls -->
    <div
      v-if="!getUserSettings.infiniteLoad.value"
      :class="{
        'fixed bottom-0 inset-x-0 z-10 max-w-3xl p-2 mx-auto sm:p-4 lg:p-6':
          getUserSettings.hoverControls.value,
      }"
    >
      <div class="flex justify-around p-2 text-center material-container">
        <!-- Previous page -->
        <button
          type="button"
          class="color-util"
          title="Load previous page"
          aria-label="Load previous page"
          @click="getPrevPage"
        >
          <span class="text-default">&larr;</span> Prev
        </button>

        <!-- Get specific page -->
        <button
          class="color-util"
          title="Load specific page"
          aria-label="Load specific page"
          type="button"
          @click="getSpecificPage"
        >
          {{ getPageID }}
        </button>

        <!-- Next page -->
        <button
          type="button"
          class="color-util"
          title="Load next page"
          aria-label="Load next page"
          @click="getNextPage"
        >
          Next <span class="text-default">&rarr;</span>
        </button>
      </div>
    </div>

    <!-- Infinite loading -->
    <div
      v-else
      v-intersect.quiet="InfiniteLoadHandler"
      class="mx-auto"
      @click="InfiniteLoadHandler"
    >
      <p class="pb-2 text-center text-default-text">Loading more posts...</p>
    </div>

    <!-- Space below all posts -->
    <div
      v-if="
        !getUserSettings.infiniteLoad.value &&
        getUserSettings.hoverControls.value
      "
      class="mb-2 sm:mb-4 lg:mb-6"
    >
      &nbsp;
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

// Third party
import { Intersect } from 'vuetify/lib/directives/intersect'

// Components
import KeyboardNavigationMixin from '~/components/pages/posts/navigation/page/KeyboardNavigationMixin.js'

export default {
  directives: {
    Intersect,
  },

  mixins: [KeyboardNavigationMixin],

  computed: {
    ...mapGetters('booru', ['getPageID']),
    ...mapGetters('user', ['getUserSettings']),
  },

  methods: {
    ...mapActions('booru', ['pidManager']),

    async getNextPage() {
      await this.pidManager({ operation: 'add' })
    },

    async getPrevPage() {
      await this.pidManager({ operation: 'subtract' })
    },

    async getSpecificPage() {
      const specificPage = Number.parseInt(
        prompt('What page do you want to go to?')
      )

      if (!specificPage) {
        alert('Wrong input, only numbers please')
        return
      }

      await this.pidManager({ operation: 'set', value: specificPage })
    },

    InfiniteLoadHandler: throttle(async function () {
      console.debug('Loading more posts')

      await this.pidManager({ operation: 'add' })
    }, 5000),
  },
}



}
</script>
