<script lang="ts" setup>
  useSeoMeta({
    title: 'Additional Boorus'
  })

  definePageMeta({ middleware: 'auth' })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>Additional Boorus</template>
      <template #text> Browse posts from other Boorus </template>
    </PageHeader>

    <!-- TODO -->
  </main>
</template>
