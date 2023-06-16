<script setup>
  useSeoMeta({
    title: 'Partners',

    description: 'Friends of the Rule 34 App, and other cool sites.'
  })
</script>

<template>
  <main class="container mx-auto max-w-3xl flex-1 px-4 sm:px-6 lg:px-8">
    <div class="mt-4 space-y-4">
      <ContentSeparator
        text="Friends of the Rule 34 App"
        title="Partners"
      />

      <ContentContainer
        :links="[
          {
            text: 'hentaiporn.app',
            href: 'https://hentaiporn.app/?utm_source=Rule34App&utm_medium=Partners'
          }
        ]"
        icon="bg-svg-star"
        text="Sister site of the Rule 34 App, has the best high-quality Hentai Videos and Images."
        title="HentaiPorn App"
      />

      <ContentContainer
        :links="[
          {
            text: 'kurosearch.com',
            href: 'https://kurosearch.com/?utm_source=Rule34App&utm_medium=Partners'
          }
        ]"
        icon="bg-svg-star"
        text="Friend of the Rule 34 App, has a slick interface and a lot of content."
        title="Kurosearch"
      />

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
    </div>
  </main>
</template>
