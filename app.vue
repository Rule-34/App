<script setup>
  useHead({
    htmlAttrs: {
      lang: 'en',
      class: 'h-full bg-base-1000 text-base-content'
    },

    bodyAttrs: {
      class: 'h-full'
    },

    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} | Rule 34 App` : 'Rule 34 App'
    }
  })
</script>

<template>
  <NuxtLayout>
    <NuxtLoadingIndicator
      :height="5"
      :throttle="250"
    />

    <NuxtPage />
  </NuxtLayout>
</template>
