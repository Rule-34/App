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

    const tags = this.urlTags?.split(',').join(', ')

    if (tags) {
      head.title = tags

      head.meta.push({
        hid: 'description',
        name: 'description',
        content: `Rule 34 Hentai porn of ${tags} on ${this.urlDomain}.`,
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
    ...mapGetters('url', ['urlDomain', 'urlPage', 'urlTags']),
  },

  async mounted() {
    if (this.urlDomain === undefined || this.urlPage === undefined) {
      await this.setInitialUrlState()
    }
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
