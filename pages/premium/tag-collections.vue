<script lang="ts" setup>
  useSeoMeta({
    title: 'Tag collections'
  })

  definePageMeta({ middleware: 'auth' })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>Tag collections</template>
      <template #text>Create lists of tags to quickly search or filter posts</template>
    </PageHeader>

    <!-- TODO -->
  </main>
</template>
