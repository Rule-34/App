<template>
  <main class="flex flex-col h-perfect p-3">
    <div
      class="material-container w-full md:w-2/3 xl:w-1/2 m-auto p-5 shadow-xl"
    >
      <div class="flex flex-wrap">
        <div class="w-2/5 m-auto text-center text-default-text">
          <h1 class="text-lg">Settings</h1>

          <button
            title="Use me when something is not working!"
            class="text-xs color-util border-util rounded-full px-2 align-middle shadow"
            @click="removeLocalStorage"
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
    <nav class="mx-auto">
      <nuxt-link to="/usage" class="text-xs">What does X do?</nuxt-link>
    </nav>
  </main>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import SettingSwitch from '~/components/content/SettingSwitch.vue'

export default {
  components: { SettingSwitch },

  computed: mapState(['userSettings']),

  beforeDestroy() {
    // Fire analytics when exiting settings
    this.analyticManager('settings')
  },

  methods: {
    ...mapActions(['analyticManager']),
    // Remove the localStorage object and reload the window
    removeLocalStorage() {
      // Remove localstorage by key
      localStorage.removeItem('vuex')

      // And reload page to see changes
      location.reload()
    }
  },

  head() {
    return {
      title: 'Settings',
      meta: [
        {
          hid: 'settings',
          name: 'description',
          content: 'Tweak your experience on the Rule 34 App'
        }
      ]
    }
  }
}
</script>
