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

      // TODO: Improve description
      {
        name: 'description',
        content: 'Stream and download images, GIFs and videos hentai. For free!'
      },

      {
        name: 'color-scheme',
        content: 'dark'
      },

      {
        name: 'theme-color',
        content: '#000'
      },

      {
        name: 'monetization',
        content: config.public.MONETIZATION_URI
      }
    ],

    link: [
      // Favicon
      {
        rel: 'icon',
        href: '/favicon.ico',
        sizes: 'any'
      },
      {
        rel: 'icon',
        href: '/icon.svg',
        type: 'image/svg+xml'
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon-180x180.png'
      },

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
  <VitePwaManifest />

  <NuxtLoadingIndicator
    :height="5"
    :throttle="250"
  />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
