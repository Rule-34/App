<template>
  <div>
    <!-- Side Bar Toggler -->
    <div class="navigation-toggler">
      <button class="navigation-toggler-button" @click="toggleNav" title="Menu">&nbsp;</button>
      <button class="navigation-search-button" @click="toggleNav" title="Search">S</button>
    </div>

    <!-- Side bar -->
    <div class="sidebar-container" :class="{active: isActive}">
      <!-- Actual Navigation Bar -->
      <nav class="sidebar">
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

      <!-- Space for clicking out of the menu -->
      <div class="sidebar-close-area" @click="toggleNav"></div>
    </div>
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