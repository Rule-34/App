<template>
  <div
    class="container flex flex-col min-h-screen px-4 mx-auto sm:px-6 lg:px-8"
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
          <Post :post="post" />
        </li>
      </ul>

      <Controls />
    </main>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

// Components
import ErrorManager from '~/components/utils/ErrorManager.vue'
import DomainSelector from '~/components/pages/posts/domain/Selector.vue'
import Notifications from '~/components/pages/posts/navigation/Notifications.vue'
import Post from '~/components/pages/posts/content/Post.vue'
import Controls from '~/components/pages/posts/navigation/page/Controls.vue'

// Mixins
import UrlManagerMixin from '~/components/pages/posts/navigation/url/UrlManagerMixin.js'

export default {
  components: {
    ErrorManager,
    DomainSelector,
    Notifications,
    Post,
    Controls,
  },

  mixins: [UrlManagerMixin],

  computed: {
    ...mapGetters('booru', ['getPosts']),
  },
}
</script>
