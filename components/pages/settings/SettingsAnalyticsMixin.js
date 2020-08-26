import { mapState } from 'vuex'

// JS
import fireAnalytics from '~/assets/js/analytics'

export default {
  computed: mapState('user', ['settings']),

  mounted() {
    fireAnalytics('settings', { state: this.settings })
  },
}
