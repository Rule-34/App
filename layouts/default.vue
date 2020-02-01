<template>
  <!-- Apply touch for showing menu and search -->
  <div
    v-touch="{
      left: () =>
        isDashboard === true ? touchHandler('left') : sideNavManager('close'),
      right: () =>
        isDashboard === true ? touchHandler('right') : sideNavManager('open')
    }"
  >
    <div class="cool-bar" />

    <NavToggler :show-search="isDashboard ? true : false" />

    <!-- Transition for sidenav -->
    <transition name="sidenav">
      <SideNav v-if="sideNavData.isActive" />
    </transition>

    <!-- Transition for Searchbar -->
    <transition name="search">
      <Search v-if="searchData.isActive" />
    </transition>

    <!-- Layout content -->
    <!-- Should use VW margin but this is okay -->
    <nuxt class="mx-auto w-full md:w-2/3 xl:w-1/2" />
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
// Third party
import { Touch } from 'vuetify/lib/directives/touch'
// Components, I decided not to lazy load them as they break the experience
import NavToggler from '~/components/navigation/NavToggler.vue'
import SideNav from '~/components/navigation/SideNav.vue'
import Search from '~/components/components/search/Search.vue'

export default {
  // Components
  components: { SideNav, NavToggler, Search },
  directives: { Touch },

  data() {
    return { isDashboard: false }
  },

  computed: {
    ...mapState(['searchData', 'sideNavData', 'userSettings']),

    // When vuex store changes preference then apply specific theme
    themeApplied() {
      return this.userSettings.darkTheme.value
    }
  },

  // Watch for route changes
  watch: {
    $route() {
      // console.log('route changed', this.$route)

      // Close the sidenav
      this.sideNavManager('close')

      // console.log(this.$nuxt.$route.name)

      // Set different layout if we're on index
      this.TestForDashboard()
    }
  },

  mounted() {
    // Set different layout if we're on index, necessary on mounted for first page load
    this.TestForDashboard()
  },

  methods: {
    ...mapMutations(['sideNavManager', 'searchManager']),

    TestForDashboard() {
      if (this.$nuxt.$route.name === 'index') {
        this.isDashboard = true
      } else {
        this.isDashboard = false
      }
    },

    touchHandler(direction) {
      switch (direction) {
        // If swipìng left and menu is not open then open search
        case 'left':
          if (!this.sideNavData.isActive) {
            this.searchManager({ isActive: true })
          } else {
            this.sideNavManager('close')
          }

          break

        // If swiping right and search is open then close search
        case 'right':
          if (!this.sideNavData.isActive && this.searchData.isActive) {
            this.searchManager({ isActive: false })
          } else {
            this.sideNavManager('open')
          }
          break
      }
    }
  },

  // Set theme and background color in the body dynamically thanks to the vuex store computed property
  head() {
    return {
      // Define template for every page
      titleTemplate: '%s | Rule 34 App',
      bodyAttrs: {
        class: this.themeApplied ? 'dark bg-background' : 'light bg-background'
      }
    }
  }
}

// Preload logo
const logo = new Image()
logo.src = '/icon.png'
</script>
