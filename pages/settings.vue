<script lang="ts" setup>
  import { version } from '~/package.json'
  import { ExclamationTriangleIcon } from '@heroicons/vue/20/solid'
  import { toast } from 'vue-sonner'
  import { project } from '@/config/project'

  useSeoMeta({
    title: 'Settings',

    description: `Options to configure how ${project.name} works.`
  })

  const appVersion = version

  const { postFullSizeImages, postsPerPage, autoplayAnimatedMedia } = useUserSettings()
  const { isPremium } = useUserData()
  const { selectedList, defaultBlockList, customBlockList, resetCustomBlockList } = useBlockLists()

  function onSelectedListChange(value: blockListOptions) {
    if (value === blockListOptions.Custom && !isPremium.value) {
      toast.error('You need to be a Premium member to use the custom blocklist')
      return
    }

    selectedList.value = value
  }

  function onBlockListFormSubmit(event: Event) {
    const value = (event.target as HTMLFormElement).elements.customBlockList.value

    let tags: string[] = []

    if (value) {
      tags = value
        .split('\n')
        // Remove empty lines
        .flatMap((tag: string) => {
          tag = tag.trim()

          if (!tag) {
            return []
          }

          return tag
        })
    }

    customBlockList.value = tags

    toast.success('Custom block list saved')
  }

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
      <template #text> Options to configure how {{ project.name }} works</template>
    </PageHeader>

    <!-- Settings -->
    <section class="mx-2 mt-4 flex-auto">
      <ol class="space-y-4">
        <!-- autoplayAnimatedMedia -->
        <li>
          <SettingSwitch v-model="autoplayAnimatedMedia">
            <template #name> Autoplay GIFs</template>

            <template #description> Automatically play animated GIFs without requiring a click </template>
          </SettingSwitch>
        </li>

        <!-- postFullSizeImages -->
        <li>
          <SettingSwitch v-model="postFullSizeImages">
            <template #name> Full size images</template>

            <template #description>
              Display the highest-resolution image available on posts, even though it may consume more data and memory
            </template>
          </SettingSwitch>
        </li>

        <!-- postsPerPage -->
        <li>
          <SettingNumber
            v-model.number="postsPerPage"
            :max="100"
            :min="1"
          >
            <template #name> Posts per page</template>

            <template #description> How many posts to load per page</template>
          </SettingNumber>
        </li>

        <!-- BlockList -->
        <li>
          <SettingSelect
            :modelValue="selectedList"
            :options="Object.values(blockListOptions)"
            @update:modelValue="onSelectedListChange"
          >
            <template #name> Tag block list</template>

            <template #description> Automatically block posts that contain any tags that you dont want to see</template>
          </SettingSelect>

          <p
            v-if="selectedList === blockListOptions.Default"
            class="text-base-content mt-2 text-xs"
          >
            Tags blocked by default:
            {{ defaultBlockList.join(', ') }}
          </p>

          <template v-else-if="selectedList === blockListOptions.Custom">
            <form
              class="mt-2 flex flex-col gap-2.5"
              @submit.prevent="onBlockListFormSubmit"
            >
              <textarea
                :placeholder="'One tag per line:\n' + defaultBlockList.join('\n')"
                :value="customBlockList.join('\n')"
                class="focus-visible:focus-outline-util hover:hover-bg-util text-base-content-highlight ring-base-0/20 placeholder:text-base-content block w-full rounded-md border-0 bg-transparent py-1.5 text-sm shadow-xs ring-1 ring-inset sm:leading-6"
                name="customBlockList"
                rows="4"
              />

              <button
                class="hover:hover-bg-util focus-visible:focus-outline-util hover:hover-text-util ring-base-0/20 self-end rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors focus-visible:ring-inset"
                type="submit"
              >
                Save
              </button>
            </form>
          </template>
        </li>
      </ol>
    </section>

    <!-- Reset -->
    <section class="mx-2 mt-24 flex flex-row items-center justify-between gap-2">
      <label for="reset">
        <span class="text-base-content-highlight leading-8 font-medium">
          Reset
          <ExclamationTriangleIcon
            aria-hidden="true"
            class="inline-block h-4 w-4"
          />
        </span>

        <span class="block text-sm"> Clear settings, cookies, and all other app data </span>
      </label>

      <button
        id="reset"
        class="hover:hover-bg-util focus-visible:focus-outline-util hover:hover-text-util ring-base-0/20 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors focus-visible:ring-inset"
        type="button"
        @click="removeAllData"
      >
        Reset
      </button>
    </section>

    <footer class="mt-2">
      <span class="text-base-content-highlight block text-center text-sm"> v{{ appVersion }} </span>
    </footer>
  </main>
</template>
