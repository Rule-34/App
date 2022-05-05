<template>
  <div
    class="flex flex-col max-w-3xl min-h-screen px-4 mx-auto sm:px-6 lg:px-8"
  >
    <portal to="side-nav-area">
      <SearchToggler :tag-count="getTags.length" />
    </portal>

    <portal to="search">
      <SearchWrapper>
        <Search
          :initial-active-tags="getTags"
          :search-results="searchResults"
          @search="onSearch"
          @reset-search-results="resetSearchResults"
          @submit-active-tags="onSubmitActiveTags"
        />
      </SearchWrapper>
    </portal>

    <!-- Top menu -->
    <nav class="flex flex-row items-center justify-between py-4">
      <DomainSelector
        :active-domain="getActiveBooru.domain"
        :domain-group-list="booruGroupList"
        @domainChange="onDomainChange"
      />

      <Notifications />
    </nav>

    <!-- Content -->
    <main class="flex flex-col flex-auto min-h-full pb-4 space-y-4">

      <ul class="flex-auto space-y-4">
        <template v-if="getPosts.length">
          <li v-for="POST in getPosts" :key="POST.id">
            <Post :post="POST" />
          </li>
        </template>

        <template v-else>
          <li class="my-3 text-center text-gray-300">
            There are no posts available.
          </li>
        </template>
      </ul>

      <PostsControls
        :current-page="getPageID"
        :minimum-page="getActiveBooruType.initialPageID"
        @setPage="onPageChange"
      />
    </main>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

// Mixins
import FetchPostsMixin from '~/components/pages/posts/post/FetchPostsMixin.js'
import { SeoHelper } from "~/assets/js/SeoHelper";

export default {
  mixins: [FetchPostsMixin],

  middleware: 'FixPostsRoute',

  data() {
    return {
      searchResults: [],
    }
  },

  head() {
    const head = {
      meta: [
        // Necessary so images can be loaded from other domains
        {
          hid: 'referrer',
          name: 'referrer',
          content: 'no-referrer',
        },
      ],
    }

    // Join array of tags into a comma separated string
    const tags = SeoHelper.tagArrayToTitle(this.getTags)

    if (tags) {
      head.title = tags + ' Hentai Porn'

      head.meta.push({
        hid: 'description',
        name: 'description',
        content: `Browse popular Rule 34 ${ tags } Hentai Porn for free.`,
      })
    }

    return head
  },

  computed: {
    ...mapGetters('booru', [
      'getActiveBooru',
      'getActiveBooruType',
      'getDefaultBooruList',
      'getPremiumBooruList',
      'getPosts',
      'getPageID',
      'getTags',
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
        domains: DOMAINS_FROM_DEFAULT_BOORU_LIST,
      }

      BOORU_GROUP_LIST.push(DEFAULT_BOORU_GROUP)

      // Premium Booru list
      const DOMAINS_FROM_PREMIUM_BOORU_LIST = this.getPremiumBooruList.map(
        (BOORU) => BOORU.domain
      )

      const PREMIUM_BOORU_GROUP = {
        name: 'Custom',
        domains: ['<Add Booru>'],
      }

      if (this.isUserPremium) {
        PREMIUM_BOORU_GROUP.domains = [
          ...DOMAINS_FROM_PREMIUM_BOORU_LIST,
          ...PREMIUM_BOORU_GROUP.domains,
        ]
      }

      BOORU_GROUP_LIST.push(PREMIUM_BOORU_GROUP)

      return BOORU_GROUP_LIST
    },
  },

  methods: {
    ...mapActions('booru', [
      'activeBooruManager',
      'pidManager',
      'tagsManager',
      'fetchTags',
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
    },
  },
}
</script>
