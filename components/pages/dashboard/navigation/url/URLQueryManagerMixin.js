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
  },

  watch: {
    stateDomain() {
      this.setURLQueries()
    },

    statePID() {
      this.setURLQueries()
    },

  async created() {
    this.checkAndAddToStateURLQueries()

    this.setURLQueries()

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

    setURLQueries() {
      this.$router.push({
        path: this.$route.path,
        query: {
          domain: this.stateDomain,
          pid: this.statePID,
        },
      })
    },
  },
}
