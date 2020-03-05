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
    <nuxt class="mx-auto w-full md:w-2/3 xl:w-1/2" style="padding-top: 1px;" />
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
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
    // Necessary on mounted for first page load
    this.TestForDashboard()

    // Fetch notifications, once as its in mounted (Could potentially waste data if visitors arent on Dashboard)
    this.getCorsProxy({
      url:
        'https://gistcdn.githack.com/VoidlessSeven7/2fe43e0eee40be63d9b2a582b2793cf9/raw/app-notifications.json',
      returnTo: 'notificationManager',
      operation: 'setData',
      returnData: 'data'
    })
  },

  methods: {
    ...mapActions(['fetchWithMode']),
    ...mapMutations(['sideNavManager', 'searchManager']),

    // Set different layout if we're on index
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
            this.searchManager({ mode: 'setSearch', data: true })
          } else {
            this.sideNavManager('close')
          }

          break

        // If swiping right and search is open then close search
        case 'right':
          if (!this.sideNavData.isActive && this.searchData.isActive) {
            this.searchManager({ mode: 'setSearch', data: false })
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
// const logo = new Image()
// logo.src = '/icon.png'

// Message to people that open the Devtools
console.info(
  '%cWe ❤︎ open source!',
  'font-size:32px;font-weight:bold;letter-spacing:0.02em;color:hsl(205, 78%, 62%);background-color:white;padding:8px 16px;'
)
console.info(
  '%cContribute: https://github.com/VoidlessSeven7/Rule-34-App\nJoin our discord: https://discord.gg/fUhYHSZ',
  'background-color:hsl(0, 0%, 7%);padding:4px 8px;font-size:16px;color:white;'
)
</script>
