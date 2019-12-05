<template>
  <div>
    <!-- Actual Navigation Bar -->
    <nav class="sidebar">
      <!-- Hero Image -->
      <div class="w-full h-48 overflow-hidden">
        <img class="sidebar-img" src="/icon.png" alt="Rule 34 App Logo" title="Rule 34 App" />
      </div>

      <!-- Navbar Links -->
      <div class="p-3">
        <ul class="nav-links text-center md:text-left leading-loose">
          <li class="group">
            <nuxt-link to="/" class="group-hover:text-primary">Dashboard</nuxt-link>
          </li>

          <li class="group">
            <nuxt-link to="/faq" class="group-hover:text-primary">Faq</nuxt-link>
          </li>

          <li class="group">
            <nuxt-link to="/usage" class="group-hover:text-primary">Usage</nuxt-link>
          </li>

          <li class="group">
            <nuxt-link to="/about" class="group-hover:text-primary">About</nuxt-link>
          </li>

          <li class="group">
            <nuxt-link to="/settings" class="group-hover:text-primary">Settings</nuxt-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Space for clicking out of the menu -->
    <div @click="sideNavManager" class="sidebar-close-area" />
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
