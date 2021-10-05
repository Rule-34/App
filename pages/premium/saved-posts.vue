<template>
  <main class="flex flex-col max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <ContentSeparator title="Saved posts" />

    <nav class="flex flex-row items-center justify-between py-4">
      <DomainSelector
        :active-domain="selectedBooru"
        :domain-group-list="boorusThatHaveSavedPosts"
        @domainChange="onDomainChange"
      />
    </nav>

    <ul class="pb-4 space-y-4">
      <template v-if="paginatedSavedPosts.length">
        <li v-for="POST in paginatedSavedPosts" :key="POST.id">
          <Post :post="POST" :view-only="true" />
        </li>
      </template>

      <template v-else>
        <li class="my-3 text-center text-gray-300">
          There are no saved posts. Go save some!
        </li>
      </template>
    </ul>

    <PostsControls :current-page="currentPage" @setPage="onPageChange" />
  </main>
</template>

<script>
import { mapGetters } from 'vuex'

function paginateArray(array, pageSize, pageNumber) {
  return array.slice(pageNumber * pageSize, pageNumber * pageSize + pageSize)
}

export default {
  data() {
    return {
      selectedBooru: '<All Boorus>',
      currentPage: 0,
    }
  },

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

  computed: {
    ...mapGetters('user', ['getSavedPosts', 'getUserSettings']),

    boorusThatHaveSavedPosts() {
      const BOORU_DOMAIN_LIST = this.getSavedPosts.map(
        (POST) => POST.meta_data.booru_domain
      )

      const UNIQUE_SORTED_BOORU_DOMAIN_LIST = [
        ...new Set(BOORU_DOMAIN_LIST),
      ].sort()

      const BOORU_GROUP = {
        name: 'Default',
        domains: ['<All Boorus>', ...UNIQUE_SORTED_BOORU_DOMAIN_LIST],
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

    paginatedSavedPosts() {
      const SAVED_POSTS = this.savedPostsFromSelectedBooru

      const POSTS_PER_PAGE = this.getUserSettings.postsPerPage.value

      const PAGINATED_SAVED_POSTS = paginateArray(
        SAVED_POSTS,
        POSTS_PER_PAGE,
        this.currentPage
      )

      return PAGINATED_SAVED_POSTS
    },
  },

  methods: {
    onDomainChange(DOMAIN) {
      this.selectedBooru = DOMAIN

      this.currentPage = 0
    },

    onPageChange(page) {
      this.currentPage = page
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
