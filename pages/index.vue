<template>
  <main>
    <!-- Menu -->
    <div class="flex flex-row justify-between m-5">
      <DomainSelector class="my-auto" />

      <Notifications />
    </div>

    <Errors />

    <Post v-for="post in posts.data" :key="post.id" :post="post" />

    <Controls />
  </main>
</template>

<script>
import { mapState } from 'vuex'

// Components
import DomainSelector from '~/components/pages/posts/domain/Selector.vue'
import Post from '~/components/pages/posts/content/Post.vue'
import Errors from '~/components/utils/Errors.vue'

// Mixins
import PostsStartupMixin from '~/components/pages/posts/util/PostsStartupMixin.js'

export default {
  components: {
    Errors,
    DomainSelector,
    Notifications: () =>
      import('~/components/pages/posts/navigation/Notifications.vue'),
    Post,
    Controls: () =>
      import('~/components/pages/posts/navigation/page/Controls.vue'),
  },

  // mixins: [URLQueryManagerMixin], // TODO: Remake this
  mixins: [PostsStartupMixin],

  computed: {
    ...mapState('booru', ['posts']),
  },

  head() {
    return {
      title: 'Posts',
    }
  },
}
</script>
