<script lang='ts' setup>
import PageHeader from '~/components/layout/PageHeader.vue'

useSeoMeta({
  title: 'Migrate old data'
})

// definePageMeta({ middleware: 'auth' })
</script>

<template>
  <main class='container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8'>
    <!-- -->

    <PageHeader>
      <template #title>Migrate old data</template>
      <template #text>
        <div class='text-sm'>
          With the new version of the app, we have changed the way we store your data.

          This means that you will need to migrate your data to the new format.

          Don't worry, we will do this for you automatically once you click the button below.
        </div>
      </template>
    </PageHeader>

    <section class='mt-8 flex justify-around'>
      <!-- -->
    </section>
  </main>
</template>
