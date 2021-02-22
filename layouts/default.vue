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
      <div v-if="isSideNavActive" class="fixed z-20 w-full h-screen">
        <SideNav class="h-full bg-black bg-opacity-25" />
      </div>
    </transition>

    <transition name="search">
      <div v-if="isSearchActive" class="fixed z-30 w-full h-screen">
        <Search class="h-full bg-black bg-opacity-25" />
      </div>
    </transition>

    <!-- Layout content -->
    <div class="px-4 mx-auto overflow-auto max-w-7xl sm:px-6 lg:px-8">
      <nuxt class="max-w-4xl mx-auto" />
    </div>

    <SupportPopUpManager />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

// Third party
import { Touch } from 'vuetify/lib/directives/touch'

// Components
import NavToggler from '~/components/layout/navigation/sidenav/Toggler.vue'
import SideNav from '~/components/layout/navigation/sidenav/SideNav.vue'
import Search from '~/components/pages/posts/navigation/search/Search.vue'
import SupportPopUpManager from '~/components/utils/SupportPopUpManager.vue'

import GlobalStartUpMixin from '~/components/utils/GlobalStartUpMixin.js'
import NavigationMixin from '~/components/layout/navigation/NavigationMixin.js'
import TouchHandlerMixin from '~/components/layout/navigation/sidenav/TouchHandlerMixin.js'

export default {
  name: 'DefaultLayout',

  components: { SideNav, NavToggler, Search, SupportPopUpManager },

  directives: { Touch },

  /**
   * Warning:
   * Some methods and variables are set by Mixins
   */
  mixins: [NavigationMixin, TouchHandlerMixin],

  head() {
    return {
      // Define color theme based on settings
      bodyAttrs: {
        class: this.getUserSettings.darkTheme.value
          ? 'dark bg-background'
          : 'light bg-background',
      },
    }
  },

  computed: {
    ...mapGetters('navigation', ['isSideNavActive', 'isSearchActive']),
    ...mapGetters('user', ['getUserSettings']),
  },
}

console.info(
  '%cWe ❤︎ open source!',
  'font-size:32px;font-weight:bold;letter-spacing:0.02em;color:hsl(205, 78%, 62%);background-color:white;padding:8px 16px;'
)
console.info(
  '%cContribute: https://redirect.r34.app/github\nJoin our discord: https://redirect.r34.app/discord',
  'background-color:hsl(0, 0%, 7%);padding:4px 8px;font-size:16px;color:white;'
)
</script>

<style lang="postcss">
/* Transition */

/* Initial state */
.sidenav-enter,
.sidenav-leave-to {
  transform: translateX(-100vw);
}

/* Toggled stated */
.sidenav-enter-to {
  transform: translateX(0px);
}

/* Transition that is gonna be applied */
.sidenav-enter-active,
.sidenav-leave-active {
  @apply transition-transform duration-300 ease-in-out;
}

/* Initial state */
.search-enter,
.search-leave-to {
  transform: translateX(100vw);
}

/* Toggled stated */
.search-enter-to {
  transform: translateX(0px);
}

/* Transition that is gonna be applied */
.search-enter-active,
.search-leave-active {
  @apply transition-transform duration-300 ease-in-out;
}
</style>
