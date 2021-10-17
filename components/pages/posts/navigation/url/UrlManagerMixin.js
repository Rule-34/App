import { mapGetters, mapActions } from 'vuex'
import { isEqual, debounce } from 'lodash-es'

export default {
  head() {
    const head = {
      meta: [
        {
          hid: 'referrer',
          name: 'referrer',
          content: 'no-referrer',
        },
      ],
    }

    const tags = this.getTags.join(', ')

    if (tags) {
      head.title = tags

      head.meta.push({
        hid: 'description',
        name: 'description',
        content: `Rule 34 Hentai porn of ${tags} on ${this.getActiveBooru.domain}.`,
      })
    }

    return head
  },

  async fetch() {
    await this.debouncedFetchPosts()
  },

  // Fetch option
  fetchOnServer: false,

  watch: {
    '$route.query': '$fetch',
  },

  computed: {
  },

  async mounted() {
    if (this.urlDomain === undefined || this.urlPage === undefined) {
      await this.setInitialUrlState()
    }
    ...mapGetters('booru', ['getActiveBooru', 'getTags']),
  },

  methods: {
    ...mapActions('url', ['setInitialUrlState']),
    ...mapActions('booru', ['fetchPosts']),

    debouncedFetchPosts: debounce(
      async function () {
        await this.fetchPosts()
      },
      1,
      { maxWait: 5 }
    ),
  },
}
