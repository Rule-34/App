<template>
  <!-- Apply touch for showing menu and search -->
  <div
    v-touch="{
      left: (e) => touchHandler('left', e),
      right: (e) => touchHandler('right', e),
    }"
  >
    <NavToggler :show-search="isPostsPage" />

    <transition name="sidenav">
      <SideNav v-if="sideNav.isActive" />
    </transition>

    <transition name="search">
      <Search v-if="search.isActive" />
    </transition>

    <!-- Layout content -->
    <div class="px-4 mx-auto overflow-auto max-w-7xl sm:px-6 lg:px-8">
      <nuxt class="max-w-4xl mx-auto" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

// Third party
import { Touch } from 'vuetify/lib/directives/touch'

// Components
import NavToggler from '~/components/layout/navigation/sidenav/Toggler.vue'
import SideNav from '~/components/layout/navigation/sidenav/SideNav.vue'
import GlobalStartUpMixin from '~/components/utils/GlobalStartUpMixin.js'
import SideNavMixin from '~/components/layout/navigation/sidenav/SideNavMixin.js'
import TouchHandlerMixin from '~/components/layout/navigation/sidenav/TouchHandlerMixin.js'

// Lazy loaded components
const Search = () =>
  import(
    /* webpackPrefetch: true */ '~/components/pages/posts/navigation/search/Search.vue'
  )

export default {
  name: 'DefaultLayout',

  components: { SideNav, NavToggler, Search },

  directives: { Touch },

  /**
   * Warning:
   * Some methods and variables are set by Mixins
   */
  mixins: [GlobalStartUpMixin, SideNavMixin, TouchHandlerMixin],

  computed: {
    ...mapState('navigation', ['sideNav', 'search']),
    ...mapState('user', ['settings']),
  },

  head() {
    return {
      // Define color theme based on settings
      bodyAttrs: {
        class: this.settings.darkTheme.value
          ? 'dark bg-background'
          : 'light bg-background',
      },
    }
  },
}

console.info(
  '%cWe ❤︎ open source!',
  'font-size:32px;font-weight:bold;letter-spacing:0.02em;color:hsl(205, 78%, 62%);background-color:white;padding:8px 16px;'
)
console.info(
  '%cContribute: https://github.com/AlejandroAkbal/Rule-34-App\nJoin our discord: https://discord.gg/fUhYHSZ',
  'background-color:hsl(0, 0%, 7%);padding:4px 8px;font-size:16px;color:white;'
)
</script>
