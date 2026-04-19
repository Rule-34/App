<script lang="ts" setup>
  import { ArrowDownTrayIcon, ArrowUturnLeftIcon } from '@heroicons/vue/24/solid'
  import { toast } from 'vue-sonner'
  import { downloadBlob } from '~/assets/js/DownloadHelper'
  import { createBackupState, type IBackupState, tryToRestoreV2OrV3Backup } from '~/assets/js/BackupHelper'
  import PageHeader from '~/components/layout/PageHeader.vue'
  import { project } from '@/config/project'

  const { t } = useI18n()
  const localePath = useLocalePath()
  const fileInputElement = ref<HTMLInputElement | null>(null)

  async function createBackup() {
    const currentDateString = new Date()
      .toLocaleString([], {
        timeZone: 'UTC',
        hour12: false,
        second: '2-digit',
        minute: '2-digit',
        hour: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      .replaceAll(', ', '_')
      .replaceAll('/', '-')
      .replaceAll(':', '-')

    const backupState = await createBackupState()

    const blob = new Blob([JSON.stringify(backupState)], { type: 'application/json' })

    const fileName = `${project.urls.production.hostname}_${currentDateString}_Backup.json`

    downloadBlob(blob, fileName)
  }

  async function restoreBackup() {
    if (!fileInputElement.value) {
      toast.error(t('toasts.noFileSelected'))
      return
    }

    const file = fileInputElement.value.files?.[0]

    if (!file) {
      toast.error(t('toasts.noFileSelected'))
      return
    }

    const backupState: IBackupState = JSON.parse(await file.text())

    try {
      await tryToRestoreV2OrV3Backup(backupState)
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'Backup version not supported'
          ? t('errors.backupVersionNotSupported')
          : String(error)
      toast.error(t('toasts.failedToRestoreBackup', { error: message }))
      return
    }

    window.location.href = localePath('/premium/dashboard?restoreSuccess=true')
  }

  useSeoMeta({
    title: computed(() => t('pages.premium.backupPage.seoTitle'))
  })

  definePageMeta({
    middleware: ['auth']
  })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <!-- -->

    <PageHeader>
      <template #title>{{ $t('pages.premium.backupPage.pageTitle') }}</template>
      <template #text>
        <div class="text-sm">
          {{ $t('pages.premium.backupPage.pageDescription') }}

          <span class="mt-3 block italic"> {{ $t('pages.premium.backupPage.manualNote') }} </span>
        </div>
      </template>
    </PageHeader>

    <section class="mt-8 flex justify-around">
      <!-- -->

      <!-- Backup -->
      <button
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util inline-flex min-w-[5rem] flex-col items-center gap-1.5 rounded-md p-2"
        type="button"
        @click="createBackup"
      >
        <ArrowDownTrayIcon class="h-6 w-6" />

        {{ $t('pages.premium.backupPage.backupButton') }}
      </button>

      <!-- Restore -->
      <input
        ref="fileInputElement"
        accept="application/json"
        style="display: none"
        type="file"
        @change="restoreBackup"
      />

      <button
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util inline-flex min-w-[5rem] flex-col items-center gap-1.5 rounded-md p-2"
        type="button"
        @click="$refs.fileInputElement.click()"
      >
        <ArrowUturnLeftIcon class="h-6 w-6" />

        {{ $t('pages.premium.backupPage.restoreButton') }}
      </button>
    </section>
  </main>
</template>
