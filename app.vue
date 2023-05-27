<script setup>
  const config = useRuntimeConfig()

  useHead({
    htmlAttrs: {
      lang: 'en'
    },

    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} | Rule 34 App` : 'Rule 34 App'
    },

    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },

      {
        name: 'monetization',
        content: config.public.MONETIZATION_URI
      },

      // TODO: Improve description
      {
        name: 'description',
        content: 'Stream and download images, GIFs and videos hentai. For free!'
      }
    ],

    link: [
      // Font
      {
        rel: 'stylesheet',
        type: 'text/css',
        href: 'https://rsms.me/inter/inter.css'
      }
    ]
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
