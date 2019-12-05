<template>
  <div class="fixed min-h-screen w-full z-10 flex">
    <!-- Actual Navigation Bar -->
    <nav
      class="theme-responsive-container bg-secondary border-l-0 border-b-0 shadow"
    >
      <!-- Hero Image -->
      <div class="w-full overflow-hidden relative">
        <img
          class="sidebar-img w-full h-auto object-cover"
          src="/icon.png"
          alt="Rule 34 App Logo"
        />

        <!-- Text on image -->
        <div class="absolute bottom-0 left-0 p-3">
          <h1 class="font-black">Rule 34 App</h1>
          <h3 class="font-normal">
            Enjoy all Rule 34 sites
          </h3>
        </div>
      </div>

      <!-- Navbar Links -->
      <div class="p-3 border-t border-tertiary">
        <ul class="nav-links text-center md:text-left leading-loose">
          <li class="group">
            <nuxt-link to="/" class="group-hover:text-primary"
              >Dashboard</nuxt-link
            >
          </li>

          <li class="group">
            <nuxt-link to="/faq" class="group-hover:text-primary"
              >Faq</nuxt-link
            >
          </li>

          <li class="group">
            <nuxt-link to="/usage" class="group-hover:text-primary"
              >Usage</nuxt-link
            >
          </li>

          <li class="group">
            <nuxt-link to="/about" class="group-hover:text-primary"
              >About</nuxt-link
            >
          </li>

          <li class="group">
            <nuxt-link to="/settings" class="group-hover:text-primary"
              >Settings</nuxt-link
            >
          </li>
        </ul>
      </div>
    </nav>

    <!-- Space for clicking out of the menu -->
    <div @click="sideNavManager" class="sidebar-close-area bg-black-25" />
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'SideNav',

  computed: {
    ...mapState(['searchData']),
  },
  methods: {
    ...mapMutations(['newSearchData', 'sideNavManager']),
  },
}
</script>
