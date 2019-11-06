<template>
  <div>
    <div class="cool-bar" />
    <SideNav />
    <SearchBar />
    <DashBoard />
  </div>
</template>

<script>
import DashBoard from "~/components/DashBoard.vue";
import SearchBar from "~/components/SearchBar.vue";
import SideNav from "~/components/SideNav.vue";

export default {
  components: {
    DashBoard,
    SearchBar,
    SideNav
  }
};
</script>
