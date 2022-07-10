<template>
  <main class="max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <div class="space-y-4">
      <ContentSeparator title="About" />

      <ContentContainer
        :links="[
          {
            text: 'Documentation website',
            href: 'https://docs.r34.app',
          },
        ]"
        icon="bg-svg-info"
        text="The Rule 34 App is a Progressive Web App to browse popular Rule 34 Hentai Porn for free. Without ads.

        You can find more info in the documentation website."
        title="Description"
      />
    </div>
  </main>
</template>

<script>
export default {
  head() {
    return {
      title: "About",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Information about the App."
        }
      ]
    };
  }
};
</script>
