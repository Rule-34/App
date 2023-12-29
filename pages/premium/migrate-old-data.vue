<script lang="ts" setup>
  import PageHeader from '~/components/layout/PageHeader.vue'
  import { migrateOldVersionState, removeOldVersionState } from '~/assets/js/BackupHelper'
  import { toast } from 'vue-sonner'

  async function migrateOldData() {
    try {
      await migrateOldVersionState()
    } catch (error) {
      // TODO: Sentry
      console.error(error)
      toast.error('Error migrating old data', {
        description: error.message
      })
      return
    }

    toast.success('Old data migrated successfully!')

    navigateTo('/premium')
  }

  function removeOldData() {
    removeOldVersionState()

    toast.success('Old data removed successfully!')

    navigateTo('/premium')
  }

  useSeoMeta({
    title: 'Migrate old data'
  })

  definePageMeta({ middleware: 'auth' })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <!-- -->

    <PageHeader>
      <template #title>Migrate old data</template>
      <template #text>
        <div class="text-sm">
          With the new version of the app, the data structure has changed
          <br />
          <br />
          - If you want to keep your old saved posts, tag collections, settings, etc. you need to migrate your data
          <br />
          <br />
          - If you want to start fresh, you can remove your old data (recommended, less prone to bugs)
        </div>
      </template>
    </PageHeader>

    <section class="mt-8 flex justify-around">
      <button
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20"
        type="button"
        @click="removeOldData"
      >
        Remove old data
      </button>

      <button
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20"
        type="button"
        @click="migrateOldData"
      >
        Migrate data
      </button>
    </section>
  </main>
</template>
