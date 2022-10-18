import { mapActions } from 'vuex'
import { debounce } from 'lodash-es'

export default {
  async fetch() {
    await this.debouncedFetchPosts()
  },

  // Fetch option
  fetchOnServer: false,

  watch: {
    '$route.query': '$fetch'
  },

  methods: {
    ...mapActions('booru', ['fetchPosts']),

    debouncedFetchPosts: debounce(
      async function () {
        await this.fetchPosts()
      },
      1,
      { maxWait: 5 }
    )
  }
}
