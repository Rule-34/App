import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters('premium', ['getLicenseKey']),
  },

  async mounted() {
    if (!this.getLicenseKey) {
      console.debug('No license key, nothing to fetch.')
      return
    }

    await this.authenticate()
  },

  methods: {
    ...mapActions('premium', ['authenticate']),
  },
}
