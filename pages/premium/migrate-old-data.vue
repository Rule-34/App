<script lang="ts" setup>
  import { toast } from 'vue-sonner'
  import { migrateSavedPostsToCloud } from '~/assets/js/BackupHelper'
  import PageHeader from '~/components/layout/PageHeader.vue'

  async function migrateOldData() {
    toast.info('Migrating, this might take a long time, please wait')

    await migrateSavedPostsToCloud()

    window.location.href = '/premium/dashboard?message=Saved posts migrated successfully!'
  }

  useSeoMeta({
    title: 'Migrate old data'
  })

  definePageMeta({
    middleware: ['auth', 'auth-check']
  })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <!-- -->

    <PageHeader>
      <template #title>Migrate old data</template>
      <template #text>
        <div class="text-sm">
          Saved posts are now linked to your account!

          <br />
          Please migrate your local saved posts to the cloud to access them from any device
        </div>
      </template>
    </PageHeader>

    <section class="mt-8 flex justify-around">
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
