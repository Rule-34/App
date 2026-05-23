<script lang="ts" setup>
  const { pageHistory } = usePageHistory()
</script>

<template>
  <section v-if="pageHistory.length">
    <PageHeader as="h2">
      <template #title>{{ $t('pages.home.historyTitle') }}</template>
      <template #text>{{ $t('pages.home.historyText') }}</template>
    </PageHeader>

    <ShowMore :max-height-in-rem="12">
      <PageHistory class="mt-4 sm:pr-4" />
    </ShowMore>
  </section>
</template>
