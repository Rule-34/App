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

    <ul class="space-y-4">
      <template v-if="savedPostsFromSelectedBooru.length">
        <li v-for="POST in savedPostsFromSelectedBooru" :key="POST.id">
          <Post :post="POST" :viewOnly="true" />
        </li>
      </template>

      <template v-else>
        <li class="my-3 text-center text-gray-300">
          There are no saved posts. Go save some!
        </li>
      </template>
    </ul>
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
      const BOORU_DOMAIN_LIST = this.getSavedPosts.map(
        (POST) => POST.meta_data.booru_domain
      )

      const UNIQUE_BOORU_DOMAIN_LIST = [...new Set(BOORU_DOMAIN_LIST)]

      const BOORU_GROUP = {
        name: 'Default',
        domains: ['<All Boorus>', ...UNIQUE_BOORU_DOMAIN_LIST],
      }

      return [BOORU_GROUP]
    },

    savedPostsFromSelectedBooru() {
      let SAVED_POSTS = null

      if (this.selectedBooru === '<All Boorus>') {
        //
        SAVED_POSTS = JSON.parse(JSON.stringify(this.getSavedPosts))
      } else {
        //
        const FILTERED_SAVED_POSTS = this.getSavedPosts.filter(
          (POST) => POST.meta_data.booru_domain === this.selectedBooru
        )

        SAVED_POSTS = FILTERED_SAVED_POSTS
      }

      const SORTED_SAVED_POSTS = this.sortPostsByDate(SAVED_POSTS)

      return SORTED_SAVED_POSTS
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
