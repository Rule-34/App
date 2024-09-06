<script setup>
  provideHeadlessUseId(() => useId())

  const route = useRoute()
  const config = useRuntimeConfig()

  const canonicalUrl = computed(() => {
    const url = 'https://' + config.public.APP_DOMAIN + route.fullPath

    const parsedUrl = new URL(url)

    // Remove query params: page or cursor
    parsedUrl.searchParams.delete('page')
    parsedUrl.searchParams.delete('cursor')

    return parsedUrl.href
  })

  useHead({
    htmlAttrs: {
      lang: 'en'
    },

    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} | R34.app` : 'Rule 34 App | R34.app'
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
      },
      // Canonical URL
      {
        rel: 'canonical',
        href: canonicalUrl
      },
      // Preconnect to API
      {
        rel: 'preconnect',
        href: config.public.API_URL
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

    monetization: '$ilp.uphold.com/Hf3zAn3pQ7fD',

    ogImage: () => ({
      url:
        'https://screenshot.akbal.dev/v1/capture?width=1200&height=630&url=' +
        encodeURIComponent('https://r34.app' + route.fullPath),
      width: 1200,
      height: 630
    })
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
        'https://twitter.com/Rule34App',
        'https://discord.gg/fUhYHSZ',
        'https://github.com/Rule-34/App'
      ]
    }),

    defineProduct({
      name: 'Rule 34 App',
      // @see https://www.trustpilot.com/review/r34.app
      aggregateRating: {
        ratingValue: 4.7,
        ratingCount: 81
      }
    })
  ])
</script>

<template>
  <VitePwaManifest />

  <NuxtLoadingIndicator
    :height="5"
    :throttle="250"
  />

  <NuxtRouteAnnouncer />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
