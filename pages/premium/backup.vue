<script lang="ts" setup>
  import { ArrowDownTrayIcon, ArrowUturnLeftIcon } from '@heroicons/vue/24/solid'
  import { toast } from 'vue-sonner'
  import { createBackupState, type IBackupState, tryToRestoreV2OrV3Backup } from '~/assets/js/BackupHelper'
  import PageHeader from '~/components/layout/PageHeader.vue'

  const fileInputElement = ref<HTMLInputElement | null>(null)

  function downloadBlob(blob: Blob, filename: string) {
    const objectURL = window.URL.createObjectURL(blob)

    // Create anchor element
    const anchorElement = document.createElement('a')

    anchorElement.href = objectURL
    anchorElement.target = '_blank'
    anchorElement.download = filename
    anchorElement.style.display = 'none'

    // Download
    anchorElement.click()

    // Clean up
    anchorElement.remove()
    window.URL.revokeObjectURL(objectURL)
  }

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

    const fileName = `R34App_${currentDateString}_Backup.json`

    downloadBlob(blob, fileName)
  }

  async function restoreBackup() {
    if (!fileInputElement.value) {
      toast.error('No file selected')
      return
    }

    const file = fileInputElement.value.files?.[0]

    if (!file) {
      toast.error('No file selected')
      return
    }

    const backupState: IBackupState = JSON.parse(await file.text())

    try {
      await tryToRestoreV2OrV3Backup(backupState)
    } catch (error) {
      toast.error(`Failed to restore backup: ${error}`)
      return
    }

    window.location.href = '/premium/dashboard?message=Backup restored successfully!'
  }

  useSeoMeta({
    title: 'Backup'
  })

  definePageMeta({
    middleware: ['auth']
  })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <!-- -->

    <PageHeader>
      <template #title>Backup & Restore</template>
      <template #text>
        <div class="text-sm">
          Backup your tag collections and settings

          <span class="mt-3 block italic"> This is a manual process. Remember to backup your data regularly </span>
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

        Backup
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

        Restore
      </button>
    </section>
  </main>
</template>
