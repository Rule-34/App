<script setup>
  import { project } from '@/config/project'

  const { t } = useI18n()
  const localePath = useLocalePath()

  useHead({
    script: [
      {
        src: 'https://ff.discepttaked.com/tEas9JdkyQNrPwt/121883',
        async: false,
        defer: true,

        crossorigin: 'anonymous'
      }
    ]
  })

  useSeoMeta({
    title: computed(() => t('pages.otherSites.title')),
    description: computed(() => t('pages.otherSites.description', { name: project.name }))
  })

  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        { name: t('pages.otherSites.title'), item: localePath('/other-sites') }
      ]
    })
  ])
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>{{ $t('pages.otherSites.title') }}</template>
      <template #text>{{ $t('pages.otherSites.text', { name: project.name }) }}</template>
    </PageHeader>

    <ol class="mx-2 mt-4 space-y-4">
      <li>
        <ContentContainer
          :links="[
            {
              text: 'hentaiporn.app',
              href: `https://hentaiporn.app/?utm_source=${project.urls.production.hostname}&utm_medium=friends`,
              target: '_blank'
            }
          ]"
          :text="$t('pages.otherSites.hentaiPornText', { name: project.name })"
          :title="$t('pages.otherSites.hentaiPorn')"
        />
      </li>

      <li>
        <ContentContainer
          :links="[
            {
              text: 'theporndude.com',
              href: 'https://theporndude.com',
              target: '_blank'
            }
          ]"
          :text="$t('pages.otherSites.thePornDudeText')"
          :title="$t('pages.otherSites.thePornDude')"
        />
      </li>
    </ol>
  </main>
</template>
