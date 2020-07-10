import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('premium', ['gumroad']),
  },

  async mounted() {
    if (!this.gumroad.product.license_key) {
      console.debug('No license key, nothing to fetch')

      return
    }

    await this.authenticate()
  },

  methods: {
    ...mapActions('premium', ['authenticate']),
  },
}
