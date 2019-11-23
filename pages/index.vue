<template>
  <div>
    <div class="cool-bar" />

    <!-- Transition for sidenav -->
    <transition name="sidenav">
      <SideNav v-if="dashBoardData.isActive" />
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
import SideNav from "~/components/navigation/SideNav.vue";

export default {
  components: {
    DashBoard,
    Search,
    SideNav
  },
  computed: {
    ...mapState(["searchData", "dashBoardData"])
  },
  // Load the store with posts
  async fetch({ store }) {
    await store.dispatch("getPosts");
  }
};
</script>
