<script setup>
import {project} from './config/project.ts'

provideHeadlessUseId(() => useId())

  const runtimeConfig = useRuntimeConfig()
  const { t } = useI18n()

  useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} | ${project.name}` : t('seo.title')
    }
  })

  // These meta tags will only be added during server-side rendering
  if (import.meta.server) {
    //

    useSeoMeta({
      description: computed(() => t('seo.description')),
      keywords: computed(() => t('seo.keywords'))
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
