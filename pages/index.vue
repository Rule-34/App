<template>
  <v-app>
    <v-app-bar
      absolute
      app
      height="10px"
      color="transparent"
      class="bg-gradient-lilac-blue"
      flat
    />

    <NavToggler
      @toggle-sidenav="sideNav.isActive = !sideNav.isActive"
      @toggle-search="search.isActive = !search.isActive"
      show-search
      class="tw-z-20"
    />

    <!-- Sidenav -->
    <SideNav :isActive="sideNav.isActive" />

    <!-- Transition for Searchbar -->
    <Search
      @toggle-search="search.isActive = !search.isActive"
      :isActive="search.isActive"
    />

    <!-- Content -->
    <v-content>
      <DashBoard />
    </v-content>
  </v-app>
</template>

<script>
import DashBoard from '~/components/dashboard/DashBoard.vue'
import Search from '~/components/dashboard/Search.vue'
import NavToggler from '~/components/navigation/NavToggler.vue'
import SideNav from '~/components/navigation/SideNav.vue'

export default {
  components: {
    DashBoard,
    Search,
    SideNav,
    NavToggler
  },

  data() {
    return {
      sideNav: { isActive: false },
      search: { isActive: false }
    }
  },

  computed: {
    // ...mapState([''])
  },

  // Load the store with posts
  async fetch({ store }) {
    await store.dispatch('getPosts')
  }
}
</script>
