<template>
  <div>
    <div class="cool-bar" />
    <SideNav />
    <SearchBar />
    <!-- Different width depending on screen -->
    <DashBoard class="card-container md:w-2/3 xl:w-1/2" />
  </div>
</template>

<script>
import DashBoard from "~/components/dashboard/DashBoard.vue";
import SearchBar from "~/components/dashboard/SearchBar.vue";
import SideNav from "~/components/navigation/SideNav.vue";

export default {
  components: {
    DashBoard,
    SearchBar,
    SideNav
  },
  // Load the store with posts
  async fetch({ store }) {
    await store.dispatch("getPosts");
  }
};
</script>
