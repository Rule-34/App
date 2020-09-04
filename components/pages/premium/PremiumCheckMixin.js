import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters('premium', ['getGumroadProduct']),
  },

  mounted() {
    if (!this.getGumroadProduct.license_key) {
      console.debug('No license key, nothing to fetch')
      return
    }

    this.authenticate()
  },

  methods: {
    ...mapActions('premium', ['authenticate']),
  },
}
