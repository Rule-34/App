<script lang='ts' setup>
import { ArrowDownTrayIcon, ArrowUturnLeftIcon } from '@heroicons/vue/24/solid'
import PageHeader from '~/components/layout/PageHeader.vue'
import { toast } from 'vue-sonner'
import type { ISavedPost } from '~/store/SavedPosts'
import { db as postsDb } from '~/store/SavedPosts'
import type { ITagCollection } from 'assets/js/tagCollection.dto'

interface IBackupState {
  version: number

  saved_posts: ISavedPost[]
  tag_collections: ITagCollection[]

  settings: {
    [key: string]: any
  }
}

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
  const savedPosts = await postsDb.posts.toArray()
  const { tagCollections } = useTagCollections()
  const userSettings = useUserSettings()

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

  // TODO: Only save data that is not defaulted
  const STATE: IBackupState = {
    version: 1,

    saved_posts: savedPosts,
    tag_collections: tagCollections.value,

    settings: userSettings
  }

  const blob = new Blob([JSON.stringify(STATE)], { type: 'application/json' })

  const fileName = `R34App_${ currentDateString }_Backup.json`

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

  const backupData: IBackupState = JSON.parse(await file.text())

  if (backupData.version !== 1) {
    toast.error('Invalid backup file')
    return
  }

  if (backupData.saved_posts) {
    // TODO
  }

  if (backupData.tag_collections) {
    // TODO
  }

  if (backupData.settings) {
    // TODO
  }

  toast.success('Backup restored')
}

useSeoMeta({
  title: 'Backup'
})

definePageMeta({ middleware: 'auth' })
</script>

<template>
  <main class='container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8'>
    <!-- -->

    <PageHeader>
      <template #title>Backup & Restore</template>
      <template #text>
        <div class='text-sm'>
          Backup your saved posts, tag collections and settings.


          <span class='italic block mt-3'> This is a manual process. Remember to backup your data regularly. </span>
        </div>
      </template>
    </PageHeader>

    <section class='mt-8 flex justify-around'>
      <!-- -->

      <!-- Backup -->
      <button
        class='focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util inline-flex min-w-[5rem] flex-col items-center gap-1.5 rounded-md p-2'
        type='button'
        @click='createBackup'
      >
        <ArrowDownTrayIcon class='h-6 w-6' />

        Backup
      </button>

      <!-- Restore -->
      <input
        ref='fileInputElement'
        accept='application/json'
        style='display: none'
        type='file'
        @change='restoreBackup'
      />

      <button
        class='focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util inline-flex min-w-[5rem] flex-col items-center gap-1.5 rounded-md p-2'
        type='button'
        @click='$refs.fileInputElement.click()'
      >
        <ArrowUturnLeftIcon class='h-6 w-6' />

        Restore
      </button>
    </section>
  </main>
</template>
