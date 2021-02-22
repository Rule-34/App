import { mapGetters, mapActions } from 'vuex'
import { isEqual } from 'lodash-es'

export default {
  computed: {
    ...mapGetters('url', ['urlDomain', 'urlPage', 'urlTags']),
  },

  watch: {
    async urlDomain(from, to) {
      if (from === to) {
        console.debug('Same domain, skipping...', [from, to])
        return
      }

      console.debug('URL `domain` changed.', [from, to])

      await this.fetchPosts()
    },

    async urlPage(from, to) {
      if (from === to) {
        console.debug('Same page, skipping...', [from, to])
        return
      }

      console.debug('URL `page` changed.', [from, to])

      await this.fetchPosts()
    },

    async urlTags(from, to) {
      if (isEqual(from, to)) {
        console.debug('Same tags, skipping...', [from, to])
        return
      }

      console.debug('URL `tags` changed.', [from, to])

      await this.fetchPosts()
    },
  },

  async mounted() {
    await this.setInitialUrlState()

    await this.fetchPosts()
  },

  methods: {
    ...mapActions('url', ['setInitialUrlState']),
    ...mapActions('booru', ['fetchPosts']),
  },
}
