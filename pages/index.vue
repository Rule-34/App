<template>
  <main>
    <!-- Menu -->
    <div class="flex flex-row justify-between m-5">
      <DomainSelector class="my-auto" />

      <Notifications />
    </div>

    <Errors />

    <Post v-for="post in dashBoardData.data" :key="post.id" :post="post" />

    <Controls />
  </main>
</template>

<script>
import { mapState } from 'vuex'

// Components
import DomainSelector from '~/components/pages/dashboard/domain/Selector.vue'
import Post from '~/components/pages/dashboard/content/Post.vue'
import Errors from '~/components/utils/Errors.vue'

// Mixins
import URLQueryManagerMixin from '~/components/pages/dashboard/navigation/url/URLQueryManagerMixin.js'

// Lazy loaded components
export default {
  components: {
    Errors,
    DomainSelector,
    Notifications: () =>
      import('~/components/pages/dashboard/navigation/Notifications.vue'),
    Post,
    Controls: () =>
      import('~/components/pages/dashboard/navigation/page/Controls.vue'),
  },

  mixins: [URLQueryManagerMixin],

  computed: {
    ...mapState(['dashBoardData']),
  },

  head() {
    return {
      title: 'Rule 34 App',
      titleTemplate: null,
    }
  },
}
</script>
