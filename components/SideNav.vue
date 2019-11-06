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
        <search-icon class="icon text-white w-6 h-6 inline-flex" />
      </button>
    </div>

    <!-- Side bar -->
    <div class="sidebar-container" :class="{ active: isNavActive }">
      <!-- Actual Navigation Bar -->
      <nav class="sidebar">
        <!-- Hero Image -->
        <div class="w-full h-40">
          <img
            class="sidebar-img"
            src="/icon.png"
            alt="Material Rule 34 Logo"
            title="Material Rule 34"
          />
        </div>

        <!-- Navbar Links -->
        <div class="p-3">
          <ul class="text-center md:text-left">
            <li>
              <nuxt-link to="/">
                Dashboard
              </nuxt-link>
            </li>

            <li>
              <nuxt-link to="/comments">
                Comments
              </nuxt-link>
            </li>

            <li>
              <nuxt-link to="/tags">
                Tags
              </nuxt-link>
            </li>

            <li>
              <nuxt-link to="/faq">
                FAQ
              </nuxt-link>
            </li>

            <li>
              <nuxt-link to="/about">
                About
              </nuxt-link>
            </li>

            <li>
              <nuxt-link to="/testing">
                testing
              </nuxt-link>
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
import { SearchIcon } from 'vue-feather-icons'

export default {
  name: 'SideNav',
  components: { SearchIcon },
  props: { showSearch: { type: Boolean, default: true } },
  data() {
    return {
      isNavActive: false
    }
  },
  methods: {
    toggleNav() {
      if (this.isNavActive) {
        this.isNavActive = false
        return ''
      } else if (!this.isNavActive) {
        this.isNavActive = true
        return ''
      }
    },
    toggleSearch() {
      this.$store.dispatch('toggleSearchComponent')
    }
  }
}
</script>
