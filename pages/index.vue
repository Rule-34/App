<template>
  <div>
    <div class="cool-bar" />

    <NavToggler @toggle-sidenav="sideNav.isActive = !sideNav.isActive" />

    <!-- Transition for sidenav -->
    <transition name="sidenav">
      <SideNav v-if="sideNav.isActive" class="sidebar-container" />
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
import { mapState } from "vuex";
import DashBoard from "~/components/dashboard/DashBoard.vue";
import Search from "~/components/dashboard/Search.vue";
import NavToggler from "~/components/navigation/NavToggler.vue";
import SideNav from "~/components/navigation/SideNav.vue";

export default {
  components: {
    DashBoard,
    Search,
    SideNav,
    NavToggler
  },

  data() {
    return {
      sideNav: { isActive: false }
    };
  },

  computed: {
    ...mapState(["searchData"])
  },

  // Load the store with posts
  async fetch({ store }) {
    await store.dispatch("getPosts");
  }
};
</script>
