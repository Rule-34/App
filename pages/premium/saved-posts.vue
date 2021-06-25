<template>
  <main class="flex flex-col max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <ContentSeparator title="Saved posts" />

    <nav class="flex flex-row items-center justify-between py-4">
      <DomainSelector
        :activeDomain="selectedBooru"
        :domainGroupList="boorusThatHaveSavedPosts"
        @domainChange="onDomainChange"
      />
    </nav>

    <template v-if="savedPostsFromSelectedBooru.length">
      <DynamicPostScroller
        :posts="savedPostsFromSelectedBooru"
        :postsDomain="selectedBooru"
        :viewOnly="true"
      />
    </template>

    <template v-else>
      <li class="my-3 text-center text-gray-300">
        There are no saved posts. Go save some!
      </li>
    </template>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  head() {
    return {
      title: 'Saved posts',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Save posts for later.',
        },
      ],
    }
  },

  data() {
    return {
      selectedBooru: '<All Boorus>',
    }
  },

  computed: {
    ...mapGetters('user', ['getSavedPosts']),

    boorusThatHaveSavedPosts() {
      const BOORU_DOMAINS = this.getSavedPosts.map(
        (POST) => POST.meta_data.booru_domain
      )

      const UNIQUE_BOORU_DOMAINS = [...new Set(BOORU_DOMAINS)]

      const DOMAIN_GROUP_LIST = [
        { name: 'Default', domains: ['<All Boorus>', ...UNIQUE_BOORU_DOMAINS] },
      ]

      return DOMAIN_GROUP_LIST
    },

    savedPostsFromSelectedBooru() {
      let SAVED_POSTS = null

      if (this.selectedBooru === '<All Boorus>') {
        SAVED_POSTS = JSON.parse(JSON.stringify(this.getSavedPosts))
      }

      //
      else {
        const FILTERED_SAVED_POSTS = this.getSavedPosts.filter(
          (POST) => POST.meta_data.booru_domain === this.selectedBooru
        )

        SAVED_POSTS = FILTERED_SAVED_POSTS
      }

      const SORTED_SAVED_POSTS = this.sortPostsByDate(SAVED_POSTS)

      // Transform the structure
      const SIMPLE_SAVED_POSTS = SORTED_SAVED_POSTS.map((SAVED_POST) => {
        return {
          ...SAVED_POST.data,
          _saved_post_meta_data: SAVED_POST.meta_data,
        }
      })

      return SIMPLE_SAVED_POSTS
    },
  },

  methods: {
    async onDomainChange(DOMAIN) {
      this.selectedBooru = DOMAIN
    },

    sortPostsByDate(POSTS) {
      const SORTED_POSTS = POSTS.sort((POST_A, POST_B) => {
        const POST_A_DATE_STRING = POST_A.meta_data.created_at
        const POST_B_DATE_STRING = POST_B.meta_data.created_at

        return new Date(POST_B_DATE_STRING) - new Date(POST_A_DATE_STRING)
      })

      return SORTED_POSTS
    },
  },
}
</script>
