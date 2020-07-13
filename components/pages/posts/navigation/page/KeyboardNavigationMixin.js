import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('user', ['settings']),
  },

  methods: {
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

  mounted() {
    // Navigation with keyboard
    if (this.settings.keyboardControls.value)
      document.addEventListener('keyup', this.keyboardPageHandler)
  },

  destroyed() {
    // Navigation with keyboard
    if (this.settings.keyboardControls.value)
      document.removeEventListener('keyup', this.keyboardPageHandler)
  },
}
