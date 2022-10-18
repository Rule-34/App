<template>
  <!-- 
    This should use Vue 3's teleport feature
    https://v3.vuejs.org/guide/teleport.html
  -->
  <transition name="page">
    <div
      v-if="isActive"
      class="fixed inset-0 z-40 overflow-y-auto"
      aria-label="Support pop up"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex min-h-screen items-center justify-center text-center">
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-black bg-opacity-75"
          aria-hidden="true"
          @click.self.stop="toggleSupportPopUp"
        ></div>

        <!-- Modal panel -->
        <div
          class="inline-block transform overflow-hidden px-2 text-left align-middle sm:my-8 sm:w-full sm:max-w-xl sm:p-6"
        >
          <SupportPopUp />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import fireAnalytics from '~/assets/js/analytics'

export default {
  data() {
    return {
      isActive: false
    }
  },

  computed: {
    ...mapGetters(['getTimesTheAppHasBeenOpened'])
  },

  mounted() {
    this.setTimesTheAppHasBeenOpened(this.getTimesTheAppHasBeenOpened + 1)

    // Only show popup every 10 times the app has been opened
    if (this.getTimesTheAppHasBeenOpened % 10 !== 0) {
      return
    }

    this.isActive = true

    fireAnalytics('supportPopUp')
  },

  methods: {
    ...mapMutations(['setTimesTheAppHasBeenOpened']),

    toggleSupportPopUp() {
      this.isActive = !this.isActive
    }
  }
}
</script>
