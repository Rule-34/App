<template>
  <div
    v-touch="{
      left: () => sideNavManager('close'),
      right: () => sideNavManager('open')
    }"
  >
    <div class="cool-bar" />

    <NavToggler />

    <transition name="sidenav">
      <SideNav v-if="sideNavData.isActive" class="sidebar-container" />
    </transition>

    <div class="container md:w-2/3 xl:w-1/2">
      <div class="flex h-perfect p-3 overflow-hidden">
        <a
          :class="{ zoom: userSettings.zoom.value }"
          href="https://akbal.dev/"
          target="_blank"
          rel="noopener noreferrer"
          class="material-container m-auto p-5 shadow-xl"
        >
          <div>
            <picture>
              <source srcset="/img/ALogo.webp" type="image/webp" />
              <source srcset="/img/ALogo.png" type="image/png" />
              <img
                class="mx-auto mb-5"
                src="/img/ALogo.webp"
                alt="Akbal logo"
              />
            </picture>
            <h1
              class="py-1 px-3 border rounded-full w-fit-content mx-auto bg-gray-900 text-gray-300 shadow-md mb-1"
            >
              Alejandro Akbal
            </h1>
            <small class="text-black">
              I'm a web developer and this PWA is a project that I do in my free
              time
            </small>
          </div>
        </a>
      </div>

      <!-- Donation -->
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { Touch } from 'vuetify/es5/directives/touch'
import NavToggler from '~/components/navigation/NavToggler.vue'
import SideNav from '~/components/navigation/SideNav.vue'

export default {
  components: { SideNav, NavToggler },
  directives: { Touch },

  data() {
    return {
      sideNav: { isActive: false }
    }
  },

  computed: mapState(['userSettings', 'sideNavData']),

  beforeDestroy() {
    this.sideNavManager('close')
  },

  methods: {
    ...mapMutations(['sideNavManager'])
  },

  head() {
    return {
      title: 'About | Rule 34 App'
    }
  }
}
</script>
