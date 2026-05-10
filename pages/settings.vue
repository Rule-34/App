<script lang="ts" setup>
  import { version } from '~/package.json'
  import { ExclamationTriangleIcon } from '@heroicons/vue/20/solid'
  import { toast } from 'vue-sonner'
  import { downloadBlob } from '~/assets/js/DownloadHelper'
  import { project } from '@/config/project'
  import { locales as i18nLocales } from '~/config/i18n'

  const { t, locale, setLocale } = useI18n()

  const localeOptions = i18nLocales.map((l) => ({
    code: l.code,
    label: `${l.flag} ${l.name}`
  }))

  const localeNames = localeOptions.map((l) => l.label)
  const currentLocaleName = computed(() => localeOptions.find((l) => l.code === locale.value)?.label ?? '')

  function onLocaleChange(name: string) {
    const loc = localeOptions.find((l) => l.label === name)
    if (loc) {
      setLocale(loc.code)
    }
  }

  useSeoMeta({
    title: () => t('pages.settings.title'),
    description: () => t('pages.settings.description', { name: project.name })
  })

  const appVersion = version

  const { postFullSizeImages, postsPerPage, autoplayAnimatedMedia, blockAiGeneratedImages } = useUserSettings()
  const { isPremium } = useUserData()
  const { selectedList, selectedBlockList, defaultBlockList, customBlockList } = useBlockLists()

  const blockListOptionsList = computed(() => [
    { value: blockListOptions.Default, label: t('pages.settings.blockListDefault') },
    { value: blockListOptions.Custom, label: t('pages.settings.blockListCustom') },
    { value: blockListOptions.None, label: t('pages.settings.blockListNone') }
  ])

  const blockListOptionsLabels = computed(() => blockListOptionsList.value.map((o) => o.label))

  const selectedListLabel = computed(
    () => blockListOptionsList.value.find((o) => o.value === selectedList.value)?.label ?? selectedList.value
  )

  function onSelectedListChange(label: string) {
    const option = blockListOptionsList.value.find((o) => o.label === label)

    if (!option) {
      return
    }

    if (option.value === blockListOptions.Custom && !isPremium.value) {
      toast.error(t('toasts.premiumRequiredBlocklist'))
      return
    }

    selectedList.value = option.value
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

    toast.success(t('toasts.customBlockListSaved'))
  }

  function exportBlockList() {
    if (selectedBlockList.value.length === 0) {
      toast.error(t('toasts.noBlockedTagsToExport'))
      return
    }

    const blob = new Blob([selectedBlockList.value.join('\n')], { type: 'text/plain;charset=utf-8' })
    const fileName = `${project.urls.production.hostname}_Blocklist.txt`

    downloadBlob(blob, fileName)
    toast.success(t('toasts.blockListExported'))
  }

  async function removeAllData() {
    if (!confirm(t('common.resetDataConfirm'))) {
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
      <template #title>{{ t('pages.settings.title') }}</template>
      <template #text>{{ t('pages.settings.description', { name: project.name }) }}</template>
    </PageHeader>

    <!-- Settings -->
    <section class="mx-2 mt-4 flex-auto">
      <ol class="space-y-4">
        <!-- autoplayAnimatedMedia -->
        <li>
          <SettingSwitch v-model="autoplayAnimatedMedia">
            <template #name>{{ t('pages.settings.autoplayGifsName') }}</template>
            <template #description>{{ t('pages.settings.autoplayGifsDescription') }}</template>
          </SettingSwitch>
        </li>

        <!-- postFullSizeImages -->
        <li>
          <SettingSwitch v-model="postFullSizeImages">
            <template #name>{{ t('pages.settings.fullSizeImagesName') }}</template>
            <template #description>{{ t('pages.settings.fullSizeImagesDescription') }}</template>
          </SettingSwitch>
        </li>

        <!-- postsPerPage -->
        <li>
          <SettingNumber
            v-model.number="postsPerPage"
            :max="100"
            :min="1"
          >
            <template #name>{{ t('pages.settings.postsPerPageName') }}</template>
            <template #description>{{ t('pages.settings.postsPerPageDescription') }}</template>
          </SettingNumber>
        </li>

        <!-- BlockList -->
        <li>
          <SettingSelect
            :modelValue="selectedListLabel"
            :options="blockListOptionsLabels"
            @update:modelValue="onSelectedListChange"
          >
            <template #name>{{ t('pages.settings.tagBlockListName') }}</template>
            <template #description>{{ t('pages.settings.tagBlockListDescription') }}</template>
          </SettingSelect>

          <p
            v-if="selectedList === blockListOptions.Default"
            class="text-base-content mt-2 text-xs"
          >
            {{ t('pages.settings.tagsBlockedByDefault') }}
            {{ defaultBlockList.join(', ') }}
          </p>

          <template v-else-if="selectedList === blockListOptions.Custom">
            <form
              class="mt-2 flex flex-col gap-2.5"
              @submit.prevent="onBlockListFormSubmit"
            >
              <textarea
                :placeholder="t('pages.settings.oneTagPerLine') + '\n' + defaultBlockList.join('\n')"
                :value="customBlockList.join('\n')"
                class="focus-visible:focus-outline-util hover:hover-bg-util text-base-content-highlight ring-base-0/20 placeholder:text-base-content block w-full rounded-md border-0 bg-transparent py-1.5 text-sm shadow-xs ring-1 ring-inset sm:leading-6"
                name="customBlockList"
                rows="4"
              />

              <div class="flex justify-end gap-2">
                <button
                  class="hover:hover-bg-util focus-visible:focus-outline-util hover:hover-text-util ring-base-0/20 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors focus-visible:ring-inset"
                  type="button"
                  @click="exportBlockList"
                >
                  {{ t('pages.settings.exportTxt') }}
                </button>

                <button
                  class="hover:hover-bg-util focus-visible:focus-outline-util hover:hover-text-util ring-base-0/20 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors focus-visible:ring-inset"
                  type="submit"
                >
                  {{ t('pages.settings.save') }}
                </button>
              </div>
            </form>
          </template>
        </li>

        <!-- blockAiGeneratedImages -->
        <li>
          <SettingSwitch v-model="blockAiGeneratedImages">
            <template #name>{{ t('pages.settings.blockAiPostsName') }}</template>
            <template #description>{{ t('pages.settings.blockAiPostsDescription') }}</template>
          </SettingSwitch>
        </li>

        <!-- Language -->
        <li>
          <SettingSelect
            :modelValue="currentLocaleName"
            :options="localeNames"
            @update:modelValue="onLocaleChange"
          >
            <template #name>{{ t('pages.settings.languageName') }}</template>
            <template #description>{{ t('pages.settings.languageDescription') }}</template>
          </SettingSelect>
        </li>
      </ol>
    </section>

    <!-- Reset -->
    <section class="mx-2 mt-24 flex flex-row items-center justify-between gap-2">
      <label for="reset">
        <span class="text-base-content-highlight leading-8 font-medium">
          {{ t('pages.settings.resetLabel') }}
          <ExclamationTriangleIcon
            aria-hidden="true"
            class="inline-block h-4 w-4"
          />
        </span>

        <span class="block text-sm">{{ t('pages.settings.resetDescription') }}</span>
      </label>

      <button
        id="reset"
        class="hover:hover-bg-util focus-visible:focus-outline-util hover:hover-text-util ring-base-0/20 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors focus-visible:ring-inset"
        type="button"
        @click="removeAllData"
      >
        {{ t('pages.settings.resetLabel') }}
      </button>
    </section>

    <footer class="mt-2">
      <span class="text-base-content-highlight block text-center text-sm"> v{{ appVersion }} </span>
    </footer>
  </main>
</template>
