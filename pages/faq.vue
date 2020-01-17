<template>
  <main>
    <ContentContainer
      :separator="true"
      title="General"
      text="Questions related to the App/PWA/website and its content"
    />
    <!-- What is this -->
    <ContentContainer
      title="What is this?"
      text="This is a Progressive Web App, essentially a installable web page, that acts as a client for various Rule 34 domains, it gets the images from the domain's public API and serves them, nothing is stored in any server."
      icon="info"
    />

    <!-- Copyright -->
    <ContentContainer
      title="Do you own the media content?"
      text="No, the images/videos/media are directly served from the domain's API, so I do not own any media."
      icon="info"
    />

    <!-- Settings -->
    <ContentContainer
      title="What does 'X' setting do?"
      text="All settings have a hover description, just hover your mouse on top of the setting.
There is also detailed information in the next link."
      icon="info"
    >
      <nuxt-link to="/usage">Usage information</nuxt-link>
    </ContentContainer>

    <!-- Github -->
    <ContentContainer
      title="Can I report an error?"
      text="Yes, you can report any error or suggest something you want to be added in the next link."
      icon="info"
      link="https://github.com/VoidlessSeven7/Rule-34-App"
      link-text="Github"
    />
    <!-- Roadmap -->
    <ContentContainer
      title="Is there any new feature planned?"
      text="Im glad you asked, the development is going quite nicely, you can see everything that is planned in the next link."
      icon="info"
      link="https://github.com/users/VoidlessSeven7/projects/1"
      link-text="GitHub Project"
    />

    <!-- Analytics -->
    <ContentContainer
      title="Analytics"
      text="Google analytics are used with the settings tweaked to be completeley anonymous, no personal info is gathered.
      Check their terms on the following link."
      icon="info"
      link="https://marketingplatform.google.com/about/analytics/terms/us/"
      link-text="Google Analytics TOS"
    />

    <ContentContainer
      :separator="true"
      title="Miscellaneous"
      text="Extra information that you should read"
    />

    <!-- Donations -->
    <ContentContainer
      title="Can I donate for your efforts?"
      text="Of course you can, I've been working really hard on this project, if you feel like contributing to the development please visit the next links."
      icon="donation"
      link="https://www.paypal.me/Alejandrorr7"
      link-text="Paypal"
    >
      <!-- Workaround for having two links -->
      <template slot="textRich">
        <a href="https://patreon.com/VoidlessSeven7">Patreon</a> |
      </template>
    </ContentContainer>

    <!-- Credits -->
    <ContentContainer
      title="Credits"
      text="Thanks to Jessica for drawing the logo, and me for developing the PWA."
      icon="star"
    >
      <!-- Slot -->
      <small class="text-default-text-muted">And you, the user!</small>
    </ContentContainer>
  </main>
</template>

<script>
import ContentContainer from '~/components/content/ContentContainer.vue'

export default {
  components: { ContentContainer },

  head() {
    return {
      title: 'Faq',
      meta: [
        {
          hid: 'faq',
          name: 'description',
          content: 'Frequently asked questions about the Rule 34 App'
        }
      ]
    }
  }
}
</script>
