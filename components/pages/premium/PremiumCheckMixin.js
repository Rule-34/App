import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('premium', ['gumroad']),
  },

  mounted() {
    if (!this.gumroad.product.license_key) {
      console.debug('No license key, nothing to fetch')
      return
    }

    this.authenticate()
  },

  methods: {
    ...mapActions('premium', ['authenticate']),
  },
}
