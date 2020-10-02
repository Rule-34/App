<template>
  <transition name="search">
    <div v-if="isSupportPopUpActive" class="fixed z-40 w-full h-screen">
      <SupportPopUp
        class="h-full bg-black bg-opacity-25"
        @toggleSupportPopUp="toggleSupportPopUp()"
      />
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

const SupportPopUp = () => import('./SupportPopUp.vue')

export default {
  components: {
    SupportPopUp,
  },

  data() {
    return {
      isSupportPopUpActive: false,
    }
  },

  computed: {
    ...mapGetters(['getTimesTheAppHasBeenOpened']),
  },

  watch: {
    getTimesTheAppHasBeenOpened(value) {
      if (value % 10 === 0) {
        this.isSupportPopUpActive = true
        //
      } else {
        this.isSupportPopUpActive = false
      }
    },
  },

  mounted() {
    this.setTimesTheAppHasBeenOpened(this.getTimesTheAppHasBeenOpened + 1)
  },

  methods: {
    ...mapMutations(['setTimesTheAppHasBeenOpened']),

    toggleSupportPopUp() {
      this.isSupportPopUpActive = !this.isSupportPopUpActive
    },
  },
}
</script>
