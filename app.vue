<script setup>
  import { project } from './config/project.ts'

  const { t } = useI18n()

  useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} | ${project.name}` : t('seo.title')
    }
  })

  // These meta tags will only be added during server-side rendering
  if (import.meta.server) {
    const requestUrl = useRequestURL()

    useSeoMeta({
      description: computed(() => t('seo.description')),
      keywords: computed(() => t('seo.keywords')),
      ogImage: `${requestUrl.origin}/social.jpg`,
      ogImageWidth: 1200,
      ogImageHeight: 630
    })
  }
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
