<template>
  <main class="flex flex-col h-screen p-3">
    <div
      class="w-full p-5 m-auto shadow-xl material-container md:w-2/3 xl:w-1/2"
    >
      <div class="flex flex-wrap">
        <div class="w-2/5 m-auto text-center text-default-text">
          <h1 class="text-lg">Settings</h1>

          <button
            title="Use me when something is not working!"
            class="px-2 text-xs align-middle rounded-full shadow color-util border-util"
            @click="removeLocalStorage()"
          >
            Reset
          </button>
        </div>

        <div class="flex w-3/5 m-auto">
          <div class="mx-auto">
            <SettingSwitch
              v-for="(setting, index) in settings"
              :key="index"
              :setting-index="index"
              :setting="setting"
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
import { mapState } from 'vuex'
import SettingSwitch from '~/components/pages/settings/Switch.vue'

// JS
import fireAnalytics from '~/assets/js/analytics'

export default {
  components: { SettingSwitch },

  computed: mapState('user', ['settings']),

  beforeDestroy() {
    fireAnalytics('settings', { state: this.settings })
  },

  methods: {
    removeLocalStorage() {
      localStorage.removeItem('user')

      location.reload()
    },
  },

  head() {
    return {
      title: 'Settings',
      meta: [
        {
          hid: 'settings',
          name: 'description',
          content: 'Tweak your experience on the Rule 34 App.',
        },
      ],
    }
  },
}
</script>
