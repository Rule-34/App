<template>
  <div>
  <p> HOLA </p>
    <div class="cool-bar" />
    <SideNav />
    <Search />
    <!-- Different width depending on screen -->
    <DashBoard class="container md:w-2/3 xl:w-1/2" />
  </div>
</template>

<script>
import DashBoard from "~/components/dashboard/DashBoard.vue";
import Search from "~/components/dashboard/Search.vue";
import SideNav from "~/components/navigation/SideNav.vue";

export default {
  components: {
    DashBoard,
    Search,
    SideNav
  },
  // Load the store with posts
  async fetch({ store }) {
  
    await store.dispatch("getPosts");
  }
};
</script>
