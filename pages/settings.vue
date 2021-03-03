<template>
  <div
    class="max-w-3xl relative flex flex-col items-center justify-center min-h-screen px-4 mx-auto sm:px-6 lg:px-8"
  >
    <main
      class="p-5 rounded-lg shadow-xl w-max-content bg-elevation border-util"
    >
      <div class="flex flex-row gap-x-10">
        <!-- Reset -->
        <div
          class="flex flex-col items-center justify-center flex-auto gap-y-2 text-default-text"
        >
          <h1 class="text-lg">Settings</h1>

          <button
            title="Reset all settings"
            aria-label="Reset all settings"
            class="px-2 text-xs rounded-full shadow color-util border-util bg-background"
            @click="removeLocalStorage"
          >
            Reset
          </button>
        </div>

        <div class="flex items-center justify-center flex-auto">
          <ul class="space-y-2">
            <li v-for="(setting, index) in getUserSettings" :key="index">
              <SettingSwitch :setting-index="index" :setting="setting" />
            </li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="absolute inset-x-0 bottom-0 p-2 text-center">
      <NuxtLink to="/usage" class="text-xs">What does X do?</NuxtLink>
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
