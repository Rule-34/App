<template>
  <main class="flex flex-col max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <ContentSeparator title="Saved posts" />

    <ul class="mt-4 space-y-4">
      <!-- TODO: separate with title if they are from different boorus -->
      <!-- TODO: use the same booru by the default that is active -->

      <template v-if="savedPostsFromCurrentBooru.length">
        <li v-for="post in savedPostsFromCurrentBooru" :key="post.data.id">
          <Post
            :post-domain="getActiveBooru.domain"
            :post-data="post.data"
            :view-only="true"
          />
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
      selectedBooru: 'all',
    }
  },

  computed: {
    ...mapGetters('user', ['getSavedPosts']),

    savedPostsFromSelectedBooru() {
      if (this.selectedBooru === 'all') {
        return this.getSavedPosts
      }

      return this.getSavedPosts.filter(
        (POST) => POST.meta_data.booru_domain === this.selectedBooru
      )
    },

    availableBoorusWithSavedPosts() {
      const BOORU_DOMAINS = this.getSavedPosts.map(
        (POST) => POST.meta_data.booru_domain
      )

      const UNIQUE_BOORU_DOMAINS = [...new Set(BOORU_DOMAINS)]

      return UNIQUE_BOORU_DOMAINS
    },
  },

  methods: {
    booruChangeListener(event) {
      event.preventDefault()

      const BOORU = event.target.value

      this.selectedBooru = BOORU
    },
  },
}
</script>
