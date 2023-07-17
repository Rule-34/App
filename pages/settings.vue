<script setup>
  import { version } from '~/package.json'
  import { useUserSettings } from '~/composables/useUserSettings'
  import { ExclamationTriangleIcon } from '@heroicons/vue/20/solid'

  useSeoMeta({
    title: 'Settings',

    description: 'Options to configure how the Rule 34 App works.'
  })

  const appVersion = version

  const userSettings = useUserSettings()

  async function removeAllData() {
    if (!confirm('Are you sure you want to reset all data?')) {
      return
    }

    localStorage.clear()

    const indexedDBDatabaseNames = await indexedDB.databases()

    for (const { name } of indexedDBDatabaseNames) {
      indexedDB.deleteDatabase(name)
    }

    location.reload()
  }
</script>

<template>
  <main class="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
    <!-- -->

    <PageHeader>
      <template #title>Settings</template>
      <template #text> Options to configure how the Rule 34 App works</template>
    </PageHeader>

    <!-- Settings -->
    <section class="mt-7 flex-auto">
      <ol class="space-y-6">
        <!-- navigationTouchGestures -->
        <li>
          <SettingSwitch v-model="userSettings.navigationTouchGestures">
            <template #name> Touch gestures</template>

            <template #description> Show menu on left-to-right swipe, and search on right-to-left</template>
          </SettingSwitch>
        </li>

        <!-- postFullSizeImages -->
        <li>
          <SettingSwitch v-model="userSettings.postFullSizeImages">
            <template #name> Full size images</template>

            <template #description> Load full size images on posts, very data intensive</template>
          </SettingSwitch>
        </li>

        <!-- postsPerPage -->
        <li>
          <SettingNumber
            v-model.number="userSettings.postsPerPage"
            :max="100"
            :min="1"
          >
            <template #name> Posts per page</template>

            <template #description> How many posts to load per page</template>
          </SettingNumber>
        </li>
      </ol>
    </section>

    <!-- Reset -->
    <section class="mt-24 flex flex-row items-center justify-between gap-2">
      <label for="reset">
        <span class="font-medium leading-8 text-base-content-highlight">
          Reset
          <ExclamationTriangleIcon class="inline-block h-4 w-4" />
        </span>

        <span class="block text-sm"> Clear settings, saved posts, and all other app data. </span>
      </label>

      <button
        id="reset"
        class="hover:hover-bg-util focus-visible:focus-outline-util rounded-lg px-3 py-1.5 text-sm font-medium text-base-content-highlight ring-1 ring-base-0/20 transition-colors focus-visible:ring-inset"
        type="button"
        @click="removeAllData"
      >
        Reset
      </button>
    </section>

    <footer>
      <span class="block text-center text-sm text-base-content-highlight"> v{{ appVersion }} </span>
    </footer>
  </main>
</template>
