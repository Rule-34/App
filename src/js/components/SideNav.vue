<template>
  <div>
    <!-- Navigation Bar Toggler -->
    <div class="fixed z-20">
      <button class="navigation-toggler" @click="toggleNav" title="Menu">&nbsp;</button>
    </div>

    <!-- Actual Navigation Bar -->
    <nav class="sidebar md:w-1/4" v-if="isActive">
      <!-- Hero Image -->
      <div class="w-full h-40">
        <img
          class="sidebar-img"
          src="img/logo.png"
          alt="Material Rule 34 Logo"
          title="Material Rule 34"
        />
      </div>

      <!-- Navbar Links -->
      <div class="p-3">
        <ul class="text-center md:text-left">
          <li>Home</li>
          <li>Posts</li>
          <li>Comments</li>
          <li>Categories</li>
          <li>About</li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: "side-nav",
  data() {
    return {
      isActive: false
    };
  },
  methods: {
    toggleNav: function() {
      if (this.isActive) {
        this.isActive = false;
        return;
      } else if (!this.isActive) {
        this.isActive = true;
        return;
      }
    }
  }
};
</script>