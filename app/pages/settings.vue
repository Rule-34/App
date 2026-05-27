<script lang="ts" setup>
  import { version } from '~~/package.json'
  import { ExclamationTriangleIcon } from '@heroicons/vue/20/solid'
  import { downloadBlob } from '~/assets/js/DownloadHelper'
  import { project } from '~~/config/project'
  import { locales as i18nLocales } from '~~/config/i18n'

  const { t, locale, setLocale } = useI18n()
  const { toast } = useLazyToast()
  const localePath = useLocalePath()

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

  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        { name: t('pages.settings.title'), item: localePath('/settings') }
      ]
    })
  ])

  const appVersion = version

  const { postFullSizeImages, postsPerPage, autoplayAnimatedMedia, blockAiGeneratedImages } = useUserSettings()
  const { isPremium } = useUserData()
  const { selectedList, selectedBlockList, defaultBlockList, customBlockList } = useBlockLists()
  const { initializeInBackground, setCustomBlockList } = usePremiumCloudSync()

  onNuxtReady(() => {
    void initializeInBackground()
  })

  const blockListOptionsList = computed(() => [
    { value: blockListOptions.Default, label: t('pages.settings.blockListDefault') },
    { value: blockListOptions.Custom, label: t('pages.settings.blockListCustom') },
    { value: blockListOptions.None, label: t('pages.settings.blockListNone') }
  ])

  const blockListOptionsLabels = computed(() => blockListOptionsList.value.map((o) => o.label))

  const selectedListLabel = computed(
    () => blockListOptionsList.value.find((o) => o.value === selectedList.value)?.label ?? selectedList.value
  )

  async function onSelectedListChange(label: string) {
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

  async function onBlockListFormSubmit(event: Event) {
    if (!(event.currentTarget instanceof HTMLFormElement)) {
      return
    }

    const value = new FormData(event.currentTarget).get('customBlockList')

    let tags: string[] = []

    if (typeof value === 'string' && value) {
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

    if (await setCustomBlockList(tags)) {
      toast.success(t('toasts.customBlockListSaved'))
    }
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
    const cookies = document.cookie.split('; ')

    for (let c = 0; c < cookies.length; c++) {
      const d = window.location.hostname.split('.')

      while (d.length > 0) {
        const cookieName = cookies[c]?.split(';')[0]?.split('=')[0]

        if (!cookieName) {
          break
        }

        const cookieBase =
          encodeURIComponent(cookieName) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path='
        const p = location.pathname.split('/')
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
    const deletionPromises: Promise<void>[] = []

    for (const { name } of indexedDBDatabaseNames) {
      if (!name) {
        continue
      }

      deletionPromises.push(
        new Promise<void>((resolve, reject) => {
          const request = indexedDB.deleteDatabase(name)

          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      )
    }

    await Promise.all(deletionPromises)
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
        <!-- blockAiGeneratedImages -->
        <li>
          <SettingSwitch v-model="blockAiGeneratedImages">
            <template #name>{{ t('pages.settings.blockAiPostsName') }}</template>
            <template #description>{{ t('pages.settings.blockAiPostsDescription') }}</template>
          </SettingSwitch>
        </li>

        <!-- BlockList -->
        <li>
          <SettingSelect
            :model-value="selectedListLabel"
            :options="blockListOptionsLabels"
            @update:model-value="onSelectedListChange"
          >
            <template #name>{{ t('pages.settings.tagBlockListName') }}</template>
            <template #description>{{ t('pages.settings.tagBlockListDescription') }}</template>
          </SettingSelect>

          <p
            v-if="selectedList === blockListOptions.Default"
            class="mt-2 text-xs text-base-content"
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
                class="block w-full rounded-md border-0 bg-transparent py-1.5 text-sm text-base-content-highlight shadow-xs ring-1 ring-base-0/20 ring-inset placeholder:text-base-content hover:hover-bg-util focus-visible:focus-outline-util sm:leading-6"
                name="customBlockList"
                rows="4"
              />

              <div class="flex justify-end gap-2">
                <button
                  class="rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-base-0/20 transition-colors hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util focus-visible:ring-inset"
                  type="button"
                  @click="exportBlockList"
                >
                  {{ t('pages.settings.exportTxt') }}
                </button>

                <button
                  class="rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-base-0/20 transition-colors hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util focus-visible:ring-inset"
                  type="submit"
                >
                  {{ t('pages.settings.save') }}
                </button>
              </div>
            </form>
          </template>
        </li>

        <!-- postFullSizeImages -->
        <li>
          <SettingSwitch v-model="postFullSizeImages">
            <template #name>{{ t('pages.settings.fullSizeImagesName') }}</template>
            <template #description>{{ t('pages.settings.fullSizeImagesDescription') }}</template>
          </SettingSwitch>
        </li>

        <!-- autoplayAnimatedMedia -->
        <li>
          <SettingSwitch v-model="autoplayAnimatedMedia">
            <template #name>{{ t('pages.settings.autoplayGifsName') }}</template>
            <template #description>{{ t('pages.settings.autoplayGifsDescription') }}</template>
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

        <!-- Language -->
        <li>
          <SettingSelect
            :model-value="currentLocaleName"
            :options="localeNames"
            @update:model-value="onLocaleChange"
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
        <span class="leading-8 font-medium text-base-content-highlight">
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
        class="rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-base-0/20 transition-colors hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util focus-visible:ring-inset"
        type="button"
        @click="removeAllData"
      >
        {{ t('pages.settings.resetLabel') }}
      </button>
    </section>

    <footer class="mt-2">
      <span class="block text-center text-sm text-base-content-highlight"> v{{ appVersion }} </span>
    </footer>
  </main>
</template>
