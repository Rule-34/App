<template>
  <main class="mx-auto min-h-screen max-w-3xl p-4 sm:p-6 lg:p-8">
    <div class="space-y-4">
      <ContentSeparator title="Frequently Asked Questions" />

      <ContentContainer
        :links="[
          {
            text: 'Documentation website',
            href: 'https://docs.r34.app/frequently-asked-questions'
          }
        ]"
        icon="bg-svg-info"
        text='You can find the "Frequently Asked Questions" in the documentation website.'
        title="Notice"
      />

      <ContentContainer
        :links="[
          {
            text: 'Status website',
            href: 'https://redirect.r34.app/status'
          }
        ]"
        icon="bg-svg-info"
        text="Check the status of the App, API and documentation in the status website."
        title="Status"
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
          content: 'Frequently asked questions.'
        }
      ]
    }
  }
}
</script>
