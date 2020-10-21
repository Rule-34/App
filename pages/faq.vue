<template>
  <main class="space-y-4 space-y-4-fixer">
    <ContentContainer
      :separator="true"
      title="General"
      text="Questions related to the App and its content"
    />
    <!-- What is this -->
    <ContentContainer
      title="What is this?"
      text="This is an app to browse the most popular boorus."
      icon="bg-svg-info"
    />

    <!-- Not an app -->
    <ContentContainer
      title="Hey, this is not an App, you lied!"
      text="This is a Progressive Web App, essentially a web page that can be installed on your device."
      icon="bg-svg-info"
    />

    <!-- Not an app -->
    <ContentContainer
      title="How can I install this App?"
      text="Follow the instructions on the Rule 34 App Discord."
      icon="bg-svg-info"
      :links="[{ text: 'Discord', href: 'https://redirect.r34.app/discord' }]"
    />

    <!-- Image removal -->
    <ContentContainer
      title="Can you remove an Image?"
      text="Nope, all content is directly served from the corresponding booru, you should contact that site."
      icon="bg-svg-info"
    />

    <!-- Settings -->
    <ContentContainer
      title='What does "X" setting do?'
      text="Settings have a hover description, if your device doesn't support hovering, please refer to the Usage page."
      icon="bg-svg-info"
    >
      <nuxt-link to="/usage" class="text-sm">Usage</nuxt-link>
    </ContentContainer>

    <!-- Technical separator -->
    <ContentContainer
      :separator="true"
      title="Technical"
      text="Errors, suggestions and more"
    />

    <!-- Roadmap -->
    <ContentContainer
      title="Is there any new feature planned?"
      text="Im glad you asked, the development is going quite steady, to check the roadmap and what I am currently working on, you have to be a donator."
      icon="bg-svg-info"
    />

    <!-- Helping -->
    <ContentContainer
      title="Can I help in any way?"
      text="Of course, we're always in need of support (specially artists/designers), contact me on our Discord if you want to help."
      icon="bg-svg-info"
    />

    <!-- text-sm Github -->
    <ContentContainer
      title="I found a bug/error!"
      text="You can report it on the GitHub repository, or directly to me on our Discord."
      icon="bg-svg-info"
      :links="[
        {
          text: 'GitHub',
          href: 'https://github.com/AlejandroAkbal/Rule-34-App',
        },
        {
          text: 'Discord',
          href: 'https://redirect.r34.app/discord',
        },
      ]"
    >
    </ContentContainer>

    <ContentContainer
      :separator="true"
      title="Miscellaneous"
      text="Extra information that you should read"
    />

    <!-- Donations -->
    <ContentContainer
      title="Can I donate for your efforts?"
      text="Of course you can, I've been working really hard on this project, if you feel like contributing to the development please do."
      icon="bg-svg-dollar"
      link=""
      link-text=""
      :links="[
        {
          text: 'LiberaPay',
          href: 'https://redirect.r34.app/liberapay',
        },
        {
          text: 'PayPal',
          href: 'https://redirect.r34.app/paypal',
        },
      ]"
    >
    </ContentContainer>

    <!-- Credits -->
    <ContentContainer
      title="Credits"
      text="Thanks to Jessica for drawing the logo, and me for developing the App."
      icon="bg-svg-star"
    />

    <!-- Temporal div -->
    <div style="height: 75vh" />
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
          content: 'Frequently asked questions',
        },
      ],
    }
  },
}
</script>
