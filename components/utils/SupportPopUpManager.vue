<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
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
