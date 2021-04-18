<template>
  <div
    class="flex flex-col max-w-3xl min-h-screen px-4 mx-auto sm:px-6 lg:px-8"
  >
    <!-- Top menu -->
    <nav class="flex flex-row items-center justify-between py-4">
      <DomainSelector />

      <Notifications />
    </nav>

    <!-- Content -->
    <main class="flex flex-col flex-auto min-h-full pb-4 space-y-4">
      <ErrorManager />

      <ul class="flex-auto space-y-4">
        <li v-for="post in getPosts" :key="post.id">
          <Post :post-data="post" />
        </li>
      </ul>

      <PostsControls />
    </main>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

// Mixins
import UrlManagerMixin from '~/components/pages/posts/navigation/url/UrlManagerMixin.js'

export default {
  mixins: [UrlManagerMixin],

  computed: {
    ...mapGetters('booru', ['getPosts']),
  },
}
</script>
