<template>
  <div
    class='mx-auto flex min-h-screen max-w-3xl flex-col px-4 sm:px-6 lg:px-8'
  >
    <portal to='side-nav-area'>
      <SearchToggler :tag-count='getTags.length' />
    </portal>

    <portal to='search'>
      <SearchWrapper>
        <Search
          :initial-active-tags='getTags'
          :search-results='searchResults'
          @search='onSearch'
          @reset-search-results='resetSearchResults'
          @submit-active-tags='onSubmitActiveTags'
        />
      </SearchWrapper>
    </portal>

    <!-- Top menu -->
    <nav class='flex flex-row items-center justify-between py-4'>
      <DomainSelector
        :active-domain='getActiveBooru.domain'
        :domain-group-list='booruGroupList'
        @domainChange='onDomainChange'
      />

      <Notifications />
    </nav>

    <!-- Content -->
    <main class='flex min-h-full flex-auto flex-col space-y-4 pb-4'>
      <ul class='flex-auto space-y-4'>

        <template v-if='getPosts.length'>
          <li v-for='POST in getPosts' :key='POST.id'>
            <Post :post='POST' />
          </li>
        </template>

        <template v-else-if='$fetchState.pending'>
          <li class='my-3 text-center text-gray-300'>
            Loading…
          </li>
        </template>
      </ul>

      <PostsControls
        :current-page='getPageID'
        :minimum-page='getActiveBooruType.initialPageID'
        @setPage='onPageChange'
      />
    </main>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  // Mixins
  import FetchPostsMixin from '~/components/pages/posts/post/FetchPostsMixin.js'
  import { RouterHelper } from '~/assets/js/RouterHelper'
  import { SeoHelper } from '~/assets/js/SeoHelper'

  export default {
    mixins: [FetchPostsMixin],

    middleware: 'FixPostsRoute',

    data() {
      return {
        searchResults: []
      }
    },

    head() {
      const HEAD = {
        meta: [
          // Necessary so images can be loaded from other domains
          {
            hid: 'referrer',
            name: 'referrer',
            content: 'no-referrer'
          }
        ],
        link: []
      }

      // Join array of tags into a comma separated string
      const TAGS = SeoHelper.tagArrayToTitle(this.getTags)

      if (TAGS) {
        // Title
        const TITLE = TAGS + ' Hentai Porn'

        HEAD.title = TITLE

        HEAD.meta.push({
          hid: 'og:title',
          name: 'og:title',
          content: TITLE
        })

        // Description
        const DESCRIPTION = `Browse popular ${ TAGS } Rule 34 Hentai Porn for free. Without ads.`

        HEAD.meta.push({
          hid: 'description',
          name: 'description',
          content: DESCRIPTION
        })

        HEAD.meta.push({
          hid: 'og:description',
          name: 'og:description',
          content: DESCRIPTION
        })
      }

      // Canonical
      const CANONICAL_ROUTE = RouterHelper.generatePostsRouteWithDefaults(
        this.$nuxt.$store,
        undefined,
        undefined,
        this.getTags
      )

      const RESOLVED_CANONICAL_ROUTE = this.$router.resolve(CANONICAL_ROUTE)

      const ABSOLUTE_URL = new URL(
        RESOLVED_CANONICAL_ROUTE.href,
        window.location.origin
      ).href

      HEAD.link.push({
        hid: 'canonical',
        rel: 'canonical',
        href: RESOLVED_CANONICAL_ROUTE.href
      })

      // OG Image
      HEAD.meta.push({
        hid: 'og:image',
        property: 'og:image',
        content: `https://url-shot.api-point.cf/?width=1200&height=630&url=${ encodeURI(
          ABSOLUTE_URL
        ) }`
      })

      HEAD.meta.push({
        hid: 'og:image:width',
        property: 'og:image:width',
        content: 1200
      })

      HEAD.meta.push({
        hid: 'og:image:height',
        property: 'og:image:height',
        content: 630
      })

      HEAD.meta.push({
        hid: 'og:image:type',
        property: 'og:image:type',
        content: 'image/png'
      })

      return HEAD
    },

    computed: {
      ...mapGetters('booru', [
        'getActiveBooru',
        'getActiveBooruType',
        'getDefaultBooruList',
        'getPremiumBooruList',
        'getPosts',
        'getPageID',
        'getTags'
      ]),
      ...mapGetters('premium', ['isUserPremium']),

      booruGroupList() {
        const BOORU_GROUP_LIST = []

        // Default Booru list
        const DOMAINS_FROM_DEFAULT_BOORU_LIST = this.getDefaultBooruList.map(
          (BOORU) => BOORU.domain
        )

        const DEFAULT_BOORU_GROUP = {
          name: 'Default',
          domains: DOMAINS_FROM_DEFAULT_BOORU_LIST
        }

        BOORU_GROUP_LIST.push(DEFAULT_BOORU_GROUP)

        // Premium Booru list
        const DOMAINS_FROM_PREMIUM_BOORU_LIST = this.getPremiumBooruList.map(
          (BOORU) => BOORU.domain
        )

        const PREMIUM_BOORU_GROUP = {
          name: 'Custom',
          domains: ['<Add Booru>']
        }

        if (this.isUserPremium) {
          PREMIUM_BOORU_GROUP.domains = [
            ...DOMAINS_FROM_PREMIUM_BOORU_LIST,
            ...PREMIUM_BOORU_GROUP.domains
          ]
        }

        BOORU_GROUP_LIST.push(PREMIUM_BOORU_GROUP)

        return BOORU_GROUP_LIST
      }
    },

    methods: {
      ...mapActions('booru', [
        'activeBooruManager',
        'pidManager',
        'tagsManager',
        'fetchTags'
      ]),

      async onDomainChange(domain) {
        if (domain === '<Add Booru>') {
          await this.$router.push({ name: 'premium' })
          return
        }

        await this.activeBooruManager({ operation: 'set', value: domain })

        this.resetSearchResults()
      },

      async onPageChange(page) {
        await this.pidManager({ operation: 'set', value: page })
      },

      async onSearch(query) {
        const DATA = await this.fetchTags(query)

        if (!DATA) {
          console.debug('No tag data.')
          await this.resetSearchResults()
          return
        }

        this.searchResults = DATA
      },

      resetSearchResults() {
        this.searchResults = []
      },

      async onSubmitActiveTags(tags) {
        await this.tagsManager({ operation: 'set', value: tags })
      }
    }
  }
</script>
