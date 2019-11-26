<template>
  <div
    v-touch="{
      left: () => sideNavManager('close'),
      right: () => sideNavManager('open')
    }"
  >
    <div class="cool-bar" />

    <NavToggler :show-search="true" />

    <!-- Transition for sidenav -->
    <transition name="sidenav">
      <SideNav v-if="sideNavData.isActive" class="sidebar-container" />
    </transition>

    <!-- Transition for Searchbar -->
    <transition name="search">
      <Search v-if="searchData.isActive" />
    </transition>

    <!-- Different width depending on screen -->
    <DashBoard class="container md:w-2/3 xl:w-1/2" />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { Touch } from 'vuetify/es5/directives/touch'
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

  directives: { Touch },

  computed: {
    ...mapState(['searchData', 'sideNavData'])
  },

  // Load the store with posts
  async fetch({ store }) {
    await store.dispatch('getPosts')
  },

  beforeDestroy() {
    this.sideNavManager('close')
  },

  methods: {
    ...mapMutations(['sideNavManager'])
  }
}
</script>
