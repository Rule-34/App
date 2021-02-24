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
            class="px-2 text-xs align-middle rounded-full shadow color-util border-util bg-background"
            @click="removeLocalStorage()"
          >
            Reset
          </button>
        </div>

        <div class="flex w-3/5 m-auto">
          <div class="mx-auto">
            <SettingSwitch
              v-for="(setting, index) in getUserSettings"
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
      <NuxtLink to="/usage" class="text-xs">What does X do?</NuxtLink>
    </nav>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'

import SettingSwitch from '~/components/pages/settings/Switch.vue'

export default {
  components: { SettingSwitch },

  computed: {
    ...mapGetters('user', ['getUserSettings']),
  },

  methods: {
    removeLocalStorage() {
      localStorage.clear()

      location.reload()
    },
  },

  head() {
    return {
      title: 'Settings',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Tweak your experience',
        },
      ],
    }
  },
}
</script>
