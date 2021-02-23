import { mapGetters, mapActions } from 'vuex'
import { isEqual, debounce } from 'lodash-es'

export default {
  head() {
    const tags = this.urlTags?.split(',').join(', ')

    return {
      title: tags || 'Posts',

      meta: [
        {
          hid: 'description',
          name: 'description',
          content: `Rule 34 of ${tags} on ${this.urlDomain}.`,
        },
      ],
    }
  },

  computed: {
    ...mapGetters('url', ['urlDomain', 'urlPage', 'urlTags']),
  },

  watch: {
    async urlDomain(from, to) {
      if (from === to) {
        console.debug('Same domain, skipping...', [from, to])
        return
      }

      // console.debug('URL `domain` changed.', [from, to])

      await this.debouncedFetchPosts()
    },

    async urlPage(from, to) {
      if (from === to) {
        console.debug('Same page, skipping...', [from, to])
        return
      }

      // console.debug('URL `page` changed.', [from, to])

      await this.debouncedFetchPosts()
    },

    async urlTags(from, to) {
      if (isEqual(from, to)) {
        console.debug('Same tags, skipping...', [from, to])
        return
      }

      // console.debug('URL `tags` changed.', [from, to])

      await this.debouncedFetchPosts()
    },
  },

  async mounted() {
    await this.setInitialUrlState()

    await this.fetchPosts()
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
