<template>
  <div>
    <!-- Side Bar Toggler -->
    <div class="navigation-toggler">
      <button class="navigation-toggler-button" @click="toggleNav" title="Menu">&nbsp;</button>
      <button class="navigation-search-button" @click="toggleSearch" title="Search">
        <!-- Search Icon -->
        <search-icon class="icon text-white w-6 h-6 inline-flex"></search-icon>
      </button>
    </div>

    <!-- Side bar -->
    <div class="sidebar-container" :class="{active: isNavActive}">
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

    <!-- Search component -->
    <search-bar />
  </div>
</template>

<script>
import SearchBar from "./SearchBar";
import { SearchIcon } from "vue-feather-icons";

export default {
  name: "side-nav",
  components: { SearchBar, SearchIcon },
  data() {
    return {
      isNavActive: false,
      isSearchActive: false
    };
  },
  methods: {
    toggleNav: function() {
      if (this.isNavActive) {
        this.isNavActive = false;
        return;
      } else if (!this.isNavActive) {
        this.isNavActive = true;
        return;
      }
    },
    toggleSearch: function() {
      this.$store.dispatch("toggleSearchComponent");
    }
  }
};
</script>