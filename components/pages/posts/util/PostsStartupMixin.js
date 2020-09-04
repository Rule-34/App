import { mapState, mapActions } from 'vuex'

export default {
  mounted() {
    this.setInitialPageIDAndFetch()
  },

  computed: {
    ...mapState('booru', ['posts', 'queries']),
  },

  methods: {
    ...mapActions('booru', ['fetchPosts', 'pidManager']),

    setInitialPageIDAndFetch() {
      if (this.queries.pid === undefined)
        this.pidManager({ operation: 'reset' })

      if (!this.posts.data.length) this.fetchPosts()
    },
  },
}
