<template>
  <main class="max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <div class="space-y-4">
      <ContentSeparator text="Friends of the Rule 34 App" title="Partners" />

      <ContentContainer
        :links="[
          {
            text: 'hentaiporn.app',
            href: 'https://hentaiporn.app/?utm_source=Rule34App&utm_medium=Partners',
          },
        ]"
        icon="bg-svg-star"
        text="Sister site of the Rule 34 App, high quality hentai."
        title="HentaiPorn App"
      />

      <ContentContainer
        :links="[
          {
            text: 'theporndude.com',
            href: 'https://theporndude.com',
          },
        ]"
        icon="bg-svg-star"
        text="The Porn Dude lists the world's best porn sites."
        title="ThePornDude"
      />
    </div>
  </main>
</template>

<script>
export default {
  head() {
    return {
      title: "Partners",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Friends of the Rule 34 App."
        }
      ]
    };
  }
};
</script>
