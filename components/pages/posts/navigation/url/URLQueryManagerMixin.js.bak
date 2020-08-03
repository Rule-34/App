import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import { findBoorusWithValueByKey } from '~/assets/lib/rule-34-shared-resources/util/BooruUtils.js'

export default {
  computed: {
    ...mapState(['dashBoardData', 'booruData', 'searchData']),
    ...mapGetters(['getActiveBooru', 'getActiveBooruType']),

    stateDomain() {
      return this.getActiveBooru.domain
    },

    statePID() {
      return this.dashBoardData.pid
    },

    stateTags() {
      // TODO: find function that does this specifically for URL queries
      return this.searchData.tags.toString()
    },
  },

  watch: {
    stateDomain() {
      this.setURLQueries()
    },

    statePID() {
      this.setURLQueries()
    },

    stateTags() {
      this.setURLQueries()
    },
  },

  async created() {
    this.checkAndAddToStateURLQueries()

    this.setDefaultPageIDIfUndefined()

    // this.setURLQueries()

    if (this.dashBoardData.data.length) {
      console.debug('Skip loading anything, we already have data')
      return
    }

    // console.debug('Loading posts from mixin')
    await this.fetchWithMode({ mode: 'posts', returnMode: 'add' })
  },

  methods: {
    ...mapMutations([
      'pidManager',
      'tagManager',
      'booruDataManager',
      'errorManager',
    ]),
    ...mapActions(['fetchWithMode']),

    checkAndAddToStateURLQueries() {
      const { domain, pid, tags } = this.$route.query

      /*
       * Domain
       */
      if (domain) {
        // Search for the domain
        const booruData = findBoorusWithValueByKey(
          domain,
          'domain',
          this.booruData.boorus
        )[0]

        // Check if domain data exists
        if (!booruData) {
          this.errorManager({
            operation: 'set',
            data: new Error(`The current domain "${domain}" couldnt be found`),
          })
          return
        }

        // console.debug(`Loading domain "${domain}" from URL query`)

        // Use query domain
        this.booruDataManager(domain)
      }

      /*
       * Page ID
       */
      if (pid) {
        // console.debug(`Loading PID "${pid}" from URL query`)

        this.pidManager({
          operation: 'specific',
          value: pid,
        })
      }

      /*
       * Tags
       */
      if (tags) {
        const tagArray = tags.split(',')

        // console.debug('Loading Tags from URL query')

        // console.log(tagArray)

        this.tagManager({
          operation: 'concat',
          tagArray,
        })
      }
    },

    setDefaultPageIDIfUndefined() {
      // Set PID on boot
      if (this.dashBoardData.pid === undefined) {
        // console.debug('Setting default PID')

        this.pidManager({
          operation: 'specific',
          value: this.getActiveBooruType.initialPageID,
        })
      }
    },

    setURLQueries() {
      this.$router.push({
        // path: this.$route.path,
        query: {
          domain: this.stateDomain,
          pid: this.statePID,
          ...(this.stateTags && { tags: this.stateTags }),
        },
      })
    },
  },
}
