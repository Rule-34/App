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

      // TODO: Remove this when the app is ready
      {
        name: 'robots',
        content: 'noindex'
      },

      // TODO: Improve description
      {
        name: 'description',
        content:
          'Stream and download Rule 34 porn videos, GIFs, and images from multiple Boorus in a mobile-first web app'
      },

      {
        name: 'rating',
        content: 'adult'
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
        sizes: '48x48'
      },
      {
        rel: 'icon',
        href: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon-180x180.png'
      }
    ]
  })

  useSchemaOrg([
    defineWebSite({
      name: 'Rule 34 App'
    }),
    defineWebPage(),
    defineOrganization({
      name: 'Rule 34 App',
      logo: '/icon.svg',
      sameAs: [
        'https://rule34.app',
        'https://twitter.com/Rule34App',
        'https://redirect.r34.app/twitter',
        'https://redirect.r34.app/discord',
        'https://redirect.r34.app/github'
      ]
    })
  ])
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
