<template>
  <div>
    <div class="cool-bar" />
    <SideNav :show-search="false" />
    <div class="card-container md:w-2/3 xl:w-1/2">
      <!-- What is this -->
    </div>
  </div>
</template>

<script>
import SideNav from "~/components/navigation/SideNav.vue";

export default {
  components: { SideNav }
};
</script>
