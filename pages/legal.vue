<template>
  <main>
    <!-- Separator -->
    <ContentContainer :separator="true" title="Disclaimer" />

    <!-- Remove media -->
    <ContentContainer
      title="Media content disclaimer"
      text="If you're the owner of a site where we get the media content and would like to cease this actions, please contact us or leave a GitHub issue with proof that you're the owner of that site and a message regarding the cease to actions.
          
      Keep in mind that all the content we get is from public released APIs from the site itself."
      icon="bg-svg-info"
      link="https://github.com/VoidlessSeven7/Rule-34-App"
      link-text="Github repository"
    />

    <!-- Separator -->
    <ContentContainer :separator="true" title="Privacy policy" />

    <!-- Generated online copy -->
    <ContentContainer
      title="Online copy"
      text="You can find an online copy of the Terms Of Service (TOS) in the next link."
      icon="bg-svg-info"
      link="https://www.gdprprivacynotice.com/live.php?token=EKbuSBbWgcHAwQ6QyCTgpv01fU8HGE5l"
      link-text="Terms of service"
    />

    <!-- Analytics -->
    <ContentContainer
      title="Analytics"
      text="Google analytics are used with the settings tweaked to be completely anonymous, no personal info is gathered.
      Check their terms on the following link."
      icon="bg-svg-info"
      link="https://marketingplatform.google.com/about/analytics/terms/us/"
      link-text="Google Analytics TOS"
    />

    <!-- Thank you -->
    <ContentContainer
      title="Contact"
      text="Please reach me in the following email for suggestions, requests, questions, comments, or any concerns."
      icon="bg-svg-info"
      link="mailto:contact@r34.app"
      link-text="contact@r34.app"
    />

    <ContentContainer
      title="Thank you for your interest"
      text="It's a pleasure having someone read this wall of text. :')"
      icon="bg-svg-star"
      @click.native="unlockExperimental()"
    />

    <!-- Temporal div TODO: remove -->
    <div style="height:75vh;" />
  </main>
</template>

<script>
import { mapMutations } from 'vuex'
import ContentContainer from '~/components/content/ContentContainer.vue'

export default {
  components: { ContentContainer },

  data() {
    return {
      clicks: 0
    }
  },

  methods: {
    ...mapMutations(['experimentalManager', 'domainManager']),

    // Shh it's a secret!
    unlockExperimental() {
      if (this.clicks >= 7) {
        this.clicks = 0
        console.info('Experimental features enabled!')
        this.experimentalManager('enable')
      } else {
        this.clicks++
        console.log(this.clicks)
        // Reset to default domain
        this.domainManager('xxx')
        // Disable features
        this.experimentalManager('disable')
      }
    }
  },

  head() {
    return {
      title: 'Legal',
      meta: [
        {
          hid: 'legal',
          name: 'description',
          content: 'Legal information about the Rule 34 App'
        }
      ]
    }
  }
}
</script>
