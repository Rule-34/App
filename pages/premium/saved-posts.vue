<template>
  <main class="flex flex-col max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <ContentSeparator title="Saved posts" />

    <select
      id="booru-selector"
      name="booru"
      aria-label="Change the domain where the saved posts are shown"
      @change="booruChangeListener"
    >
      <option value="all" selected>&lt;All&gt;</option>

      <template v-for="booru in availableBoorusWithSavedPosts">
        <option :value="booru" :key="booru" :selected="selectedBooru === booru">
          {{ booru }}
        </option>
      </template>
    </select>

    <ul class="mt-4 space-y-4">
      <!-- TODO: separate with title if they are from different boorus -->
      <!-- TODO: use the same booru by the default that is active -->

      <template v-if="savedPostsFromSelectedBooru.length">
        <li v-for="POST in savedPostsFromSelectedBooru" :key="POST.data.id">
          <Post
            :post-domain="POST.meta_data.booru_domain"
            :post-data="POST.data"
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
