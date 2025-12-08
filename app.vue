<script setup>
  import { project } from './config/project.ts'

  provideHeadlessUseId(() => useId())

  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()

  const canonicalUrl = computed(() => {
    const url = 'https://' + project.urls.production.hostname + route.fullPath

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
      return titleChunk ? `${titleChunk} | ${project.name}` : project.seo.title
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
        href: runtimeConfig.public.apiUrl
      }
    ]
  })

  useSeoMeta({
    charset: 'utf-8',
    viewport: 'width=device-width, initial-scale=1',

    description: project.seo.description,

    keywords: project.seo.keywords.join(', '),

    rating: 'adult',

    colorScheme: 'dark',
    themeColor: project.branding.colors.background,

    monetization: '$ilp.uphold.com/Hf3zAn3pQ7fD',

    ogImage: {
      url: '/social.jpg',
      width: 1200,
      height: 630
    }
  })
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
