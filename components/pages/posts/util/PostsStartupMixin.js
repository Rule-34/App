import { mapGetters, mapActions } from 'vuex'

export default {
  mounted() {
    this.setInitialPageIDAndFetch()
  },

  computed: {
    ...mapGetters('booru', ['getPageID', 'getPosts']),
  },

  methods: {
    ...mapActions('booru', ['fetchPosts', 'pidManager']),

    setInitialPageIDAndFetch() {
      if (this.getPageID === undefined) this.pidManager({ operation: 'reset' })

      if (!this.getPosts.length) this.fetchPosts()
    },
  },
}
