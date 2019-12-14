<template>
  <div class="fixed min-h-screen w-full z-10 flex">
    <!-- Actual Navigation Bar -->
    <!-- Only show borders on medium screens -->
    <nav
      class="text-primary-hover hover:text-primary md:border-t md:border-r border-border md:hover:border-border-hover bg-background shadow relative"
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
          <h3 class="font-normal">Enjoy all Rule 34 sites</h3>
        </div>
      </div>

      <!-- Navbar Links -->
      <div class="p-3 border-t border-border">
        <ul class="text-center md:text-left leading-loose">
          <li>
            <nuxt-link class="nav-hover-links" to="/">
              <span class="nav-spacer"></span>
              <span class="relative">Dashboard</span>
            </nuxt-link>
          </li>

          <li>
            <nuxt-link class="nav-hover-links" to="/faq">
              <span class="nav-spacer"></span>
              <span class="relative">Faq</span>
            </nuxt-link>
          </li>

          <li>
            <nuxt-link class="nav-hover-links" to="/usage">
              <span class="nav-spacer"></span>
              <span class="relative">Usage</span>
            </nuxt-link>
          </li>

          <li>
            <nuxt-link class="nav-hover-links" to="/about">
              <span class="nav-spacer"></span>
              <span class="relative">About</span>
            </nuxt-link>
          </li>

          <li>
            <nuxt-link class="nav-hover-links" to="/settings">
              <span class="nav-spacer"></span>
              <span class="relative">Settings</span>
            </nuxt-link>
          </li>
        </ul>

        <ul
          class="absolute bottom-0 left-0 w-full pb-3 flex flex-row justify-around"
        >
          <li>
            <nuxt-link class="nav-hover-links" to="/legal">
              <span class="relative">Legal </span>
            </nuxt-link>
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
    ...mapMutations(['sideNavManager']),
  },
}
</script>
