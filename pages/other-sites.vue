<script setup>
  import { project } from '@/config/project'

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
    title: 'Other sites',

    description: `Partners of ${project.name}, and other cool sites.`
  })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>Other sites</template>
      <template #text>Partners of {{ project.name }}, and other cool sites</template>
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
          :text="`Sister site of ${project.name}, has the best high-quality hentai images and videos`"
          title="Hentai Porn"
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
          text="The Porn Dude lists the world's best porn sites"
          title="ThePornDude"
        />
      </li>
    </ol>
  </main>
</template>
