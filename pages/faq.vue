<template>
  <main class="max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <div class="space-y-4">
      <ContentSeparator title="General" text="Questions related to the App" />

      <ContentContainer
        title="Notice"
        text="The 'Frequently Asked Questions' page has been moved to the documentation subdomain."
        icon="bg-svg-info"
        :links="[
          {
            text: 'Frequently Asked Questions',
            href: 'https://docs.r34.app/frequently-asked-questions',
          },
        ]"
      />
    </div>
  </main>
</template>

<script>
export default {
  head() {
    return {
      title: 'Faq',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Frequently asked questions.',
        },
      ],
    }
  },
}
</script>
