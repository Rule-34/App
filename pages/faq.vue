<template>
  <main class="space-y-4 space-y-4-fixer">
    <ContentContainer
      :separator="true"
      title="General"
      text="Questions related to the App"
    />

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
  </main>
</template>

<script>
import ContentContainer from '~/components/utils/ContentContainer.vue'

export default {
  components: { ContentContainer },

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
