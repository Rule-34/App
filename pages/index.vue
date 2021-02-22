<template>
  <main class="space-y-4 space-y-4-fixer">
    <!-- Menu -->
    <div class="flex flex-row items-center justify-between">
      <DomainSelector />

      <Notifications />
    </div>

    <!-- Content -->
    <ErrorManager />

    <template v-for="post in getPosts">
      <Post :key="post.id" :post="post" />
    </template>

    <Controls />
  </main>
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
