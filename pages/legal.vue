<template>
  <main class="container--separator">
    <!-- Separator -->
    <ContentContainer :separator="true" title="Disclaimer" />

    <!-- Remove media -->
    <ContentContainer
      title="Media content disclaimer"
      text="If you're the owner of a site where we get the media content and would like to cease this actions, please contact us or leave a GitHub issue with proof that you're the owner of that site and a message regarding the cease to actions.
          
      Keep in mind that all the content we get is from public released APIs from the site itself."
      icon="bg-svg-info"
      :links="[
        {
          text: 'Github repository',
          href: 'https://github.com/AlejandroAkbal/Rule-34-App',
        },
      ]"
    />

    <!-- Separator -->
    <ContentContainer :separator="true" title="Privacy policy" />

    <!-- Generated terms of service -->
    <ContentContainer
      title="Terms of service"
      text="You can find an online copy of the Terms Of Service (TOS) in the next link."
      icon="bg-svg-info"
      :links="[
        {
          text: 'Terms of service',
          href: '/terms-of-service',
        },
      ]"
    />

    <!-- Generated terms of service -->
    <ContentContainer
      title="Privacy policy"
      text="You can find an online copy of the Privacy policy in the next link."
      icon="bg-svg-info"
      :links="[
        {
          text: 'Privacy policy',
          href: '/privacy-policy',
        },
      ]"
    />

    <!-- Analytics -->
    <ContentContainer
      title="Analytics"
      text="Self hosted Matomo analytics are used with everything tweaked to be completely anonymous, no personal info is gathered, opt out on the next link."
      icon="bg-svg-info"
      :links="[
        {
          text: 'Opt Out',
          href: '/privacy-policy#opt-out',
        },
      ]"
    />

    <!-- Contact -->
    <ContentContainer
      title="Contact"
      text="Please reach me in the following email for suggestions, requests, questions, comments, or any concerns."
      icon="bg-svg-info"
      :links="[
        {
          text: 'contact@r34.app',
          href: 'mailto:contact@r34.app',
        },
      ]"
    />

    <!-- Thank you -->
    <ContentContainer
      title="Thank you for your interest"
      text="It's a pleasure having someone read this wall of text."
      icon="bg-svg-star"
    />

    <!-- Temporal div TODO: remove -->
    <div style="height: 75vh;" />
  </main>
</template>

<script>
import ContentContainer from '~/components/utils/ContentContainer.vue'

export default {
  components: { ContentContainer },

  head() {
    return {
      title: 'Legal',
      meta: [
        {
          hid: 'legal',
          name: 'description',
          content: 'Legal information about the Rule 34 App.',
        },
      ],
    }
  },
}
</script>
