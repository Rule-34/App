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

    // Cookies
    clearCookies()

    // LocalStorage
    clearLocalStorage()

    // IndexedDB
    await clearIndexedDb()

    location.reload()
  }

  /**
   * @see https://stackoverflow.com/a/33366171
   */
  function clearCookies() {
    var cookies = document.cookie.split('; ')

    for (var c = 0; c < cookies.length; c++) {
      var d = window.location.hostname.split('.')

      while (d.length > 0) {
        var cookieBase =
          encodeURIComponent(cookies[c].split(';')[0].split('=')[0]) +
          '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' +
          d.join('.') +
          ' ;path='
        var p = location.pathname.split('/')
        document.cookie = cookieBase + '/'
        while (p.length > 0) {
          document.cookie = cookieBase + p.join('/')
          p.pop()
        }

        d.shift()
      }
    }
  }

  function clearLocalStorage() {
    localStorage.clear()
  }

  async function clearIndexedDb() {
    const indexedDBDatabaseNames = await indexedDB.databases()

    for (const { name } of indexedDBDatabaseNames) {
      indexedDB.deleteDatabase(name)
    }
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
    <section class="mx-2 mt-4 flex-auto">
      <ol class="space-y-4">
        <!-- postFullSizeImages -->
        <li>
          <SettingSwitch v-model="userSettings.postFullSizeImages">
            <template #name> Full size images</template>

            <template #description>
              Display the highest-resolution image available on posts, even though it may consume more data and memory
            </template>
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
    <section class="mx-2 mt-24 flex flex-row items-center justify-between gap-2">
      <label for="reset">
        <span class="font-medium leading-8 text-base-content-highlight">
          Reset
          <ExclamationTriangleIcon class="inline-block h-4 w-4" />
        </span>

        <span class="block text-sm"> Clear settings, saved posts, and all other app data </span>
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

    <footer class="mt-2">
      <span class="block text-center text-sm text-base-content-highlight"> v{{ appVersion }} </span>
    </footer>
  </main>
</template>
