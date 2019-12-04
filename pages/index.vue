<template>
  <div>
    <!-- Different width depending on screen -->
    <DashBoard />
  </div>
</template>

<script>
import DashBoard from '~/components/dashboard/DashBoard.vue'

export default {
  components: {
    DashBoard,
  },

  // Load the store with posts

  // NOTE: This is now replicated in ~/plugins/vuex-persist so the subsequentials loads can be from the localStorage domain

  async fetch({ store }) {
    await store.dispatch('getPosts')
  },
}
</script>
