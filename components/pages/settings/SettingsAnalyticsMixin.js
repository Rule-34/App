import { mapGetters } from 'vuex'

// JS
import fireAnalytics from '~/assets/js/analytics'

export default {
  computed: mapGetters('user', ['getUserSettings']),

  mounted() {
    fireAnalytics('settings', { state: this.getUserSettings })
  }
}
