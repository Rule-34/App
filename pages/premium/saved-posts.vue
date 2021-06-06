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
import { mapGetters, mapActions } from 'vuex'

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
    return {}
  },

  computed: {
    ...mapGetters('user', ['getSavedPosts']),
    ...mapGetters('booru', ['getActiveBooru']),

    savedPostsFromCurrentBooru() {
      const currentDomain = this.getActiveBooru.domain

      return this.getSavedPosts[currentDomain]
    },
  },

  methods: {
    ...mapActions('user', ['addPostToSavedPosts', 'removePostFromSavedPosts']),
  },

  created() {
    const testDomain = this.getActiveBooru.domain
    const testPost = {
      id: 1,
      score: null,
      high_res_file: {
        url: 'https://safebooru.org/images/1/e7b3dc281d431f7a9f4ab81986d2de9a20d36d2e.jpg',
        width: 1200,
        height: 900,
      },
      low_res_file: {
        url: 'https://safebooru.org/samples/1/sample_e7b3dc281d431f7a9f4ab81986d2de9a20d36d2e.jpg',
        width: 850,
        height: 638,
      },
      preview_file: {
        url: 'https://safebooru.org/thumbnails/1/thumbnail_e7b3dc281d431f7a9f4ab81986d2de9a20d36d2e.jpg',
        width: 150,
        height: 112,
      },
      tags: [
        '1girl',
        'bag',
        'black_hair',
        'blush',
        'bob_cut',
        'bowieknife',
        'breath',
        'coat',
        'girls',
        'gloves',
        'jacket',
        'landscape',
        'miniskirt',
        'mountain',
        'necktie',
        'original',
        'pantyhose',
        'peacoat',
        'purse',
        'scarf',
        'short_hair',
        'skirt',
        'snow',
        'solo',
        'toggles',
        'uniform',
      ],
      source: [],
      rating: 'safe',
      media_type: 'image',
    }

    // this.addPostToSavedPosts({ domain: testDomain, post: testPost })
    // this.removePostFromSavedPosts({ domain: testDomain, post: testPost })
  },
}
</script>
