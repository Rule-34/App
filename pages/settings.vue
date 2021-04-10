<template>
  <div
    class="relative flex flex-col items-center justify-center max-w-3xl min-h-screen px-4 mx-auto sm:px-6 lg:px-8"
  >
    <main class="p-5 w-max material-container">
      <div class="flex flex-row space-x-10">
        <!-- Reset -->
        <div
          class="flex flex-col items-center justify-center flex-auto space-y-2"
        >
          <h1 class="text-lg text-white">Settings</h1>

          <button
            title="Reset all settings"
            aria-label="Reset all settings"
            class="px-2 py-1 text-xs rounded-full border-util link bg-darkGray-700"
            @click="removeLocalStorage"
          >
            Reset
          </button>
        </div>

        <div class="flex items-center justify-center flex-auto">
          <ul class="space-y-3">
            <template v-for="(settingData, settingName) in getUserSettings">
              <li :key="settingName">
                <template
                  v-if="
                    settingData && Number.isInteger(settingData.defaultValue)
                  "
                >
                  <SettingNumber
                    :setting-name="settingName"
                    :settingData="settingData"
                  />
                </template>

                <template v-else>
                  <SettingSwitch
                    :setting-name="settingName"
                    :settingData="settingData"
                  />
                </template>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </main>

    <footer class="absolute inset-x-0 bottom-0 p-2 text-center">
      <NuxtLink to="/usage" class="text-sm link"> What does X do? </NuxtLink>
    </footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
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
