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
      <div class="flex items-center justify-center min-h-screen text-center">
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-black bg-opacity-75"
          aria-hidden="true"
          @click.self.stop="toggleSupportPopUp"
        ></div>

        <!-- Modal panel -->
        <div
          class="inline-block px-2 overflow-hidden text-left align-middle transform sm:my-8 sm:max-w-xl sm:w-full sm:p-6"
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
      isSupportPopUpActive: false,
    }
  },

  computed: {
    ...mapGetters(['getTimesTheAppHasBeenOpened']),
  },

  mounted() {
    this.setTimesTheAppHasBeenOpened(this.getTimesTheAppHasBeenOpened + 1)

    if (this.getTimesTheAppHasBeenOpened % 10 === 0) {
      this.isSupportPopUpActive = true

      fireAnalytics('supportPopUp')
    } else {
      this.isSupportPopUpActive = false
    }
  },

  methods: {
    ...mapMutations(['setTimesTheAppHasBeenOpened']),

    toggleSupportPopUp() {
      this.isSupportPopUpActive = !this.isSupportPopUpActive
    },
  },
}
</script>
