<template>
  <main>
    <!-- Menu -->
    <div class="m-5 flex flex-row justify-between">
      <DomainSelector class="my-auto" />

      <Notifications />
    </div>

    <Errors />

    <Post v-for="post in dashBoardData.data" :key="post.id" :post="post" />

    <Controls />
  </main>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'

// Components
import DomainSelector from '~/components/pages/dashboard/domain/Selector.vue'
import Post from '~/components/pages/dashboard/content/Post.vue'
import Errors from '~/components/utils/Errors.vue'

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

  async middleware({ store }) {
    // Set PID on boot
    if (store.state.dashBoardData.pid === undefined) {
      store.commit('pidManager', {
        operation: 'specific',
        value: store.getters.getActiveBooruType.initialPageID,
      })
    }

    // Load the store with posts
    await store.dispatch('fetchWithMode', { mode: 'posts', returnMode: 'add' })
  },

  computed: {
    ...mapState(['dashBoardData']),
  },

  methods: {
    ...mapMutations(['pidManager']),
    ...mapActions(['fetchWithMode']),
  },

  head() {
    return {
      title: 'Rule 34 App',
      titleTemplate: null,
    }
  },
}
</script>
