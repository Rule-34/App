<script setup>
  useSeoMeta({
    title: 'Friends',

    description: 'Friends of the Rule 34 App, and other cool sites.'
  })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>Friends</template>
      <template #text>Friends of the Rule 34 App, and other cool sites</template>
    </PageHeader>

    <ol class="mx-2 mt-4 space-y-4">
      <li>
        <ContentContainer
          :links="[
            {
              text: 'hentaiporn.app',
              href: 'https://hentaiporn.app/?utm_source=r34.app&utm_medium=friends'
            }
          ]"
          icon="bg-svg-star"
          text="Sister site of the Rule 34 App, has the best high-quality hentai videos and images."
          title="HentaiPorn App"
        />
      </li>

      <li>
        <ContentContainer
          :links="[
            {
              text: 'kurosearch.com',
              href: 'https://kurosearch.com/?utm_source=r34.app&utm_medium=friends'
            }
          ]"
          icon="bg-svg-star"
          text="Dear friend of the Rule 34 App, has a slick interface and a lot of content."
          title="Kurosearch"
        />
      </li>

      <li>
        <ContentContainer
          :links="[
            {
              text: 'theporndude.com',
              href: 'https://theporndude.com'
            }
          ]"
          icon="bg-svg-star"
          text="The Porn Dude lists the world's best porn sites."
          title="ThePornDude"
        />
      </li>
    </ol>
  </main>
</template>
