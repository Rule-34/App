<template>
  <div>
    <!-- Side Bar Toggler -->
    <div class="navigation-toggler">
      <button class="navigation-toggler-button" title="Menu" @click="toggleNav">
        &nbsp;
      </button>
      <button
        v-if="showSearch"
        class="navigation-search-button"
        title="Search"
        @click="toggleSearch"
      >
        <!-- Search Icon -->
        <SearchIcon class="icon text-white w-6 h-6 inline-flex" />
      </button>
    </div>

    <!-- Side bar -->
    <div class="sidebar-container" :class="{ active: isNavActive }">
      <!-- Actual Navigation Bar -->
      <nav class="sidebar">
        <!-- Hero Image -->
        <div class="w-full h-48 overflow-hidden">
          <img
            class="sidebar-img"
            src="/icon.png"
            alt="Rule 34 PWA Logo"
            title="Rule 34 PWA"
          />
        </div>

        <!-- Navbar Links -->
        <div class="p-3">
          <ul class="nav-links text-center md:text-left leading-loose">
            <li>
              <nuxt-link to="/">Dashboard</nuxt-link>
            </li>

            <li>
              <nuxt-link to="/faq">Faq</nuxt-link>
            </li>

            <li>
              <nuxt-link to="/about">About</nuxt-link>
            </li>

            <li>
              <nuxt-link to="/settings">Settings</nuxt-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Space for clicking out of the menu -->
      <div class="sidebar-close-area" @click="toggleNav" />
    </div>
  </div>
</template>

<script>
import { SearchIcon } from "vue-feather-icons";

export default {
  name: "SideNav",
  components: { SearchIcon },
  props: { showSearch: { type: Boolean, default: true, required: false } },
  data() {
    return {
      isNavActive: false
    };
  },
  methods: {
    toggleNav() {
      if (this.isNavActive) {
        this.isNavActive = false;
        return "";
      } else if (!this.isNavActive) {
        this.isNavActive = true;
        return "";
      }
    },
    toggleSearch() {
      this.$store.dispatch("toggleSearchComponent");
    }
  }
};
</script>
