<template>
  <main class="flex flex-col max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <portal to="side-nav-area">
      <SearchToggler :tag-count="searchActiveTags.length" />
    </portal>

    <portal to="search">
      <SearchWrapper>
        <Search
          :initial-active-tags="searchActiveTags"
          :search-results="searchResults"
          @search="onSearch"
          @reset-search-results="resetSearchResults"
          @submit-active-tags="onSubmitActiveTags"
        />
      </SearchWrapper>
    </portal>

    <ContentSeparator title="Saved posts" />

    <nav class="flex flex-row items-center justify-between py-4">
      <DomainSelector
        :active-domain="selectedBooru"
        :domain-group-list="boorusThatHaveSavedPosts"
        @domainChange="onDomainChange"
      />
    </nav>

    <ul class="pb-4 space-y-4">
      <template v-if="processedSavedPosts.length">
        <li v-for="POST in processedSavedPosts" :key="POST.id">
          <Post
            :event-only="true"
            :post="POST"
            @tag-selected="onPostTagSelected"
          />
        </li>
      </template>

      <template v-else>
        <li class="my-3 text-center text-gray-300">
          There are no saved posts. Go save some!
        </li>
      </template>
    </ul>

    <PostsControls
      :current-page="currentPage"
      :force-normal-controls="true"
      :minimum-page="0"
      @setPage="onPageChange"
    />
  </main>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      selectedBooru: '<All Boorus>',

      currentPage: 0,

      searchResults: [],
      searchActiveTags: [],
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
      if (this.selectedBooru === '<All Boorus>') {
        return JSON.parse(JSON.stringify(this.getSavedPosts))
      }

      return this.getSavedPosts.filter(
        (POST) => POST.meta_data.booru_domain === this.selectedBooru
      )
    },

    processedSavedPosts() {
      const SAVED_POSTS_FROM_SELECTED_BOORU = this.savedPostsFromSelectedBooru

      const SAVED_POSTS_FILTERED_BY_ACTIVE_TAGS =
        this.filterPostsBySearchActiveTags(SAVED_POSTS_FROM_SELECTED_BOORU)

      const SAVED_POSTS_SORTED_BY_DATE = this.sortPostsByDate(
        SAVED_POSTS_FILTERED_BY_ACTIVE_TAGS
      )

      const PAGINATED_SAVED_POSTS = this.paginatePosts(
        SAVED_POSTS_SORTED_BY_DATE
      )

      return PAGINATED_SAVED_POSTS
    },
  },

  methods: {
    sortPostsByDate(POSTS) {
      return POSTS.sort((POST_A, POST_B) => {
        const POST_A_DATE_STRING = POST_A.meta_data.created_at
        const POST_B_DATE_STRING = POST_B.meta_data.created_at

        return new Date(POST_B_DATE_STRING) - new Date(POST_A_DATE_STRING)
      })
    },

    filterPostsBySearchActiveTags(POSTS) {
      if (this.searchActiveTags.length === 0) {
        return POSTS
      }

      return POSTS.filter((POST) => {
        // Filter that the post has to include every tag in the searchActiveTags array
        return this.searchActiveTags.every((TAG) =>
          POST.data.tags.includes(TAG)
        )
      })
    },

    paginatePosts(POSTS) {
      const POSTS_PER_PAGE = this.getUserSettings.postsPerPage.value

      const CURRENT_PAGE = this.currentPage

      return paginateArray(POSTS, POSTS_PER_PAGE, CURRENT_PAGE)
    },

    resetSearchResults() {
      this.searchResults = []
    },

    resetActiveTags() {
      this.searchActiveTags = []
    },

    resetCurrentPage() {
      this.currentPage = 0

      // TODO: Scroll to top until we have page queries
      this.scrollToTop()
    },

    onDomainChange(DOMAIN) {
      this.selectedBooru = DOMAIN

      this.resetCurrentPage()

      this.resetSearchResults()
      this.resetActiveTags()
    },

    onPageChange(page) {
      this.currentPage = page

      // TODO: Scroll to top until we have page queries
      this.scrollToTop()
    },

    onPostTagSelected(tag) {
      this.onSubmitActiveTags([tag])
    },

    onSearch(query) {
      const UNIQUE_TAGS_FROM_SAVED_POSTS = [
        ...new Set(
          this.savedPostsFromSelectedBooru.map((POST) => POST.data.tags).flat()
        ),
      ]

      const AVAILABLE_TAGS = UNIQUE_TAGS_FROM_SAVED_POSTS.map((TAG) => {
        return {
          id: TAG,
          name: TAG,
          count: 0,
        }
      })

      // Normalize query
      query = query.toLowerCase()

      const SEARCH_RESULTS = AVAILABLE_TAGS.filter((tag) => {
        const NORMALIZED_TAG = tag.name.toLowerCase()

        return NORMALIZED_TAG.includes(query)
      })

      this.searchResults = SEARCH_RESULTS
    },

    onSubmitActiveTags(tags) {
      this.searchActiveTags = tags

      this.resetCurrentPage()
    },

    // TODO: Scroll to top until we have page queries
    scrollToTop() {
      window.scrollTo(0, 0)
    },
  },
}

function paginateArray(array, pageSize, pageNumber) {
  return array.slice(pageNumber * pageSize, pageNumber * pageSize + pageSize)
}
</script>
