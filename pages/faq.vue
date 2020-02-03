<template>
  <main>
    <ContentContainer
      :separator="true"
      title="General"
      text="Questions related to the App and its content"
    />
    <!-- What is this -->
    <ContentContainer
      title="What is this?"
      text="This is an App to enjoy all Rule 34 sites combined in a mobile-friendly experience."
      icon="bg-svg-info"
    />

    <!-- Not an app -->
    <ContentContainer
      title="Hey, this is not an app, you lied!"
      text="This is a Progressive Web App, essentially a web page that can be installed on your device."
      icon="bg-svg-info"
    />

    <!-- Image removal -->
    <ContentContainer
      title="Can you remove an Image?"
      text="Nope, all content is directly served from the corresponding Rule 34 site, you should contact that site."
      icon="bg-svg-info"
    />

    <!-- Settings -->
    <ContentContainer
      title='What does "X" setting do?'
      text="Settings have a hover description, if your device doesn't support hovering, please refer to the Usage page."
      icon="bg-svg-info"
    >
      <nuxt-link to="/usage">Usage information</nuxt-link>
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
      text="Im glad you asked, the development is going quite steady, check our Roadmap."
      icon="bg-svg-info"
      link="https://github.com/users/VoidlessSeven7/projects/1"
      link-text="Roadmap"
    />

    <!-- Helping -->
    <ContentContainer
      title="Can I help in any way?"
      text="Of course, we're always in need of support, specially (artists and programmers), contact me on Discord if you want to help."
      icon="bg-svg-info"
    >
      <!-- Slot -->
      <small class="text-default-text-muted">Voidless#0521</small>
    </ContentContainer>

    <!-- Github -->
    <ContentContainer
      title="I found a bug/error!"
      text="You can report it on the GitHub repository, or directly to me on our Discord."
      icon="bg-svg-info"
      link="https://github.com/VoidlessSeven7/Rule-34-App"
      link-text="Github"
    >
      <!-- Workaround for having two links -->
      <template slot="textRich">
        <a href="https://discord.gg/fUhYHSZ">Discord</a> |
      </template>
    </ContentContainer>

    <!-- Analytics -->
    <ContentContainer
      title="Analytics"
      text="Google analytics are used with the settings tweaked to be completely anonymous, no personal info is gathered.
      Check their terms of use on the following link."
      icon="bg-svg-info"
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
      text="Of course you can, I've been working really hard on this project, if you feel like contributing to the development please do."
      icon="bg-svg-dollar"
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
      icon="bg-svg-star"
    >
      <!-- Slot -->
      <small class="text-default-text-muted">And you, the user!</small>
    </ContentContainer>

    <!-- Temporal div TODO: remove -->
    <div style="height:50vh;" />
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

<style>
.bg-svg {
  background-repeat: no-repeat;
  background-size: 35%;
  background-attachment: fixed;
  background-position: center right 5vw;
}

@screen md {
  .bg-svg {
    background-size: 25%;
    background-position: center right 20vw;
    /* The percentage is made based on the md screen padding of the layout (md:w-1/3) which is 66.6% plus the percentage of the base background position */

    /* Now its a completely arbitrary digit since I dont understand how background-position wants to work  */
  }
}

@screen xl {
  .bg-svg {
    background-size: 15%;
    background-position: center right 28vw;
  }
}

.bg-svg-info {
  background-image: url('~assets/img/info.svg');
}

.bg-svg-star {
  background-image: url('~assets/img/star.svg');
}

.bg-svg-dollar {
  background-image: url('~assets/img/dollar.svg');
}
</style>
