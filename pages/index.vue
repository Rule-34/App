<template>
  <div>
    <search-bar />
    <side-nav />
    <dash-board />
  </div>
</template>

<script>
import DashBoard from '~/components/DashBoard.vue'
import SearchBar from '~/components/SearchBar.vue'
import SideNav from '~/components/SideNav.vue'

export default {
  components: {
    DashBoard,
    SearchBar,
    SideNav
  },
  data() {
    return {}
  }
}
</script>
