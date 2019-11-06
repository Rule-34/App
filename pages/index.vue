<template>
  <div>
    <div class="cool-bar" />
    <SideNav />
    <SearchBar />
    <DashBoard />
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
  }
};
</script>
