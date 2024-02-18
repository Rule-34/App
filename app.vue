 <script setup>
  const config = useRuntimeConfig()

  useHead({
    htmlAttrs: {
      lang: 'en'
    },

    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} | Rule 34 App` : 'Rule 34 App'
    },

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

  useSeoMeta({
    charset: 'utf-8',
    viewport: 'width=device-width, initial-scale=1',

    // TODO: Improve description
    description:
      'Stream and download Rule 34 porn videos, GIFs, and images from multiple Boorus in a mobile-first web app',

    rating: 'adult',

    colorScheme: 'dark',
    themeColor: '#000',

    monetization: '$ilp.uphold.com/Hf3zAn3pQ7fD'
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
