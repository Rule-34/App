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
      <div class="flex flex-col h-perfect p-3">
        <div
          class="material-container w-full md:w-2/3 xl:w-1/2 m-auto p-5 shadow-xl"
        >
          <div class="flex flex-wrap">
            <div class="w-2/5 m-auto text-center">
              <h1 class=" text-lg">Settings</h1>

              <button
                @click="removeLocalStorage"
                title="Use me when something is not working!"
                class="text-xs border rounded-full px-2 align-middle shadow"
              >
                Reset
              </button>
            </div>
            <div class="w-3/5 m-auto flex">
              <div class="mx-auto">
                <SettingSwitch
                  v-for="(setting, index) in userSettings"
                  :key="setting.name"
                  :value="setting.value"
                  :text="setting.name"
                  :switch-id="index"
                  :description="setting.description"
                  class="my-1"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="mx-auto">
          <nuxt-link to="/usage" class="text-xs">What does X do?</nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { Touch } from 'vuetify/es5/directives/touch'
import NavToggler from '~/components/navigation/NavToggler.vue'
import SideNav from '~/components/navigation/SideNav.vue'
import SettingSwitch from '~/components/settings/SettingSwitch.vue'

export default {
  components: { SideNav, SettingSwitch, NavToggler },
  directives: { Touch },

  data() {
    return {
      sideNav: { isActive: false }
    }
  },

  computed: mapState(['userSettings', 'sideNavData']),

  // Fire analytics when exiting settings
  destroyed() {
    this.analytics('settings')
  },

  beforeDestroy() {
    this.sideNavManager('close')
  },

  methods: {
    ...mapActions(['analytics']),
    ...mapMutations(['sideNavManager']),
    // Remove the localStorage object and reload the window
    removeLocalStorage() {
      localStorage.removeItem('vuex')
      location.reload()
    }
  },

  head() {
    return {
      title: 'Settings | Rule 34 PWA'
    }
  }
}
</script>
