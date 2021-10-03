<template>
  <div>
    <!-- Normal controls -->
    <template v-if="!getUserSettings.infiniteLoad.value">
      <div
        :class="{
          'fixed bottom-0 inset-x-0 z-10 max-w-3xl p-2 mx-auto sm:p-4 lg:p-6':
            getUserSettings.hoverControls.value,
        }"
      >
        <div class="flex justify-around p-2 text-center material-container">
          <!-- Previous page -->
          <button
            type="button"
            class="link"
            title="Load previous page"
            aria-label="Load previous page"
            @click="getPrevPage"
          >
            <span class="text-white">&larr;</span> Prev
          </button>

          <!-- Get specific page -->
          <button
            class="link"
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
            class="link"
            title="Load next page"
            aria-label="Load next page"
            @click="getNextPage"
          >
            Next <span class="text-white">&rarr;</span>
          </button>
        </div>
      </div>

      <!-- Space below all posts -->
      <template v-if="getUserSettings.hoverControls.value">
        <div class="mt-6">&nbsp;</div>
      </template>
    </template>

    <!-- Infinite loading -->
    <template v-else-if="getUserSettings.infiniteLoad.value">
      <div
        v-intersect="{
          handler: InfiniteLoadHandler,
          options: {
            threshold: [0, 0.25, 0.5, 0.75, 1.0],
          },
        }"
        class="py-12 mx-auto"
        @click="InfiniteLoadHandler"
      >
        <p class="text-center text-gray-300 animate-pulse">
          Stay here to load more posts...
        </p>
      </div>
    </template>
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
        prompt('What page do you want to go to?'),
        10
      )

      if (isNaN(specificPage)) {
        alert('Wrong input, only numbers please.')
        return
      }

      await this.pidManager({ operation: 'set', value: specificPage })
    },

    InfiniteLoadHandler(entries, observer) {
      const elementAttribute = 'data-is-visible'
      const timeoutDelay = 1500

      // console.log({ entries, observer })

      entries.forEach((entry) => {
        // console.debug(entry.intersectionRatio)

        if (!entry.isIntersecting || entry.intersectionRatio < 1) {
          if (entry.target.getAttribute(elementAttribute)) {
            // console.debug('Removed attribute from element.')
            entry.target.removeAttribute(elementAttribute)
          }

          // console.debug('Element is not visible.')
          return
        }

        entry.target.setAttribute(elementAttribute, true)

        setTimeout(async () => {
          const isVisible = entry.target.getAttribute(elementAttribute)

          if (!isVisible) {
            // console.debug('Timeout: Element does not have attribute.')
            return
          }

          console.debug('Loading more posts...')

          await this.pidManager({ operation: 'add' })
        }, timeoutDelay)
      })
    },
  },
}
</script>
