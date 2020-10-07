<template>
  <!-- 
    This should use Vue 3's teleport feature
    https://v3.vuejs.org/guide/teleport.html
  -->
  <transition name="page">
    <div v-if="isSupportPopUpActive" class="fixed z-40 w-full h-screen">
      <SupportPopUp
        class="h-full bg-black bg-opacity-75"
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

  mounted() {
    this.setTimesTheAppHasBeenOpened(this.getTimesTheAppHasBeenOpened + 1)

    if (this.getTimesTheAppHasBeenOpened % 10 === 0) {
      this.isSupportPopUpActive = true
      //
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
