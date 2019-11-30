<template>
  <div>
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
            <nuxt-link to="/usage">Usage</nuxt-link>
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
