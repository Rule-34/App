<template>
  <main>
    <!-- Separator -->
    <ContentContainer :separator="true" title="Disclaimer" />

    <!-- Remove media -->
    <ContentContainer title="Media content" icon="info">
      <!-- Slot -->
      <template slot="textRich">
        <p>
          If you're the owner of a site where we get the media content and would
          like to cease this actions, please
          <a href="https://github.com/VoidlessSeven7/Rule-34-App"
            >leave an issue</a
          >
          with proof that you're the owner of x site and a message regarding the
          cease to actions.
          <!-- Space -->
          <br />
          Keep in mind that all
          <u>the content we get is from public released APIs</u> from the site
          itself.
        </p>
      </template>
    </ContentContainer>

    <!-- Separator -->
    <ContentContainer :separator="true" title="Privacy policy" />

    <!-- Generated online copy -->
    <ContentContainer
      title="Online copy"
      text="You can find an online copy in the next link."
      icon="info"
      link="https://www.gdprprivacynotice.com/live.php?token=1IeoZbFW8o9HQKfaZhVjqQOKFHYwhyDT"
      link-text="GDPR Privacy Notice"
    />

    <!-- Wall of text not really accurate -->
    <ContentContainer title="Privacy Policy for Rule 34 App" icon="info">
      <!-- Slot -->
      <template slot="textRich">
        <p>
          At Rule 34 App, accessible from
          <a href="https://r34.app/">r34.app</a> , one of our main priorities is
          the privacy of our visitors. This Privacy Policy document contains
          types of information that is collected and recorded by Rule 34 App and
          how we use it.
        </p>

        <!-- Space -->
        <br />

        <p>
          If you have additional questions or require more information about our
          Privacy Policy, do not hesitate to contact us.
        </p>

        <!-- Space -->
        <br />

        <h2 class="text-lg">General Data Protection Regulation (GDPR)</h2>
        <p>We are a Data Controller of your information.</p>

        <p>
          Rule 34 App legal basis for collecting and using the personal
          information described in this Privacy Policy depends on the Personal
          Information we collect and the specific context in which we collect
          the information:
        </p>

        <ul class="list-inside list-disc">
          <li>Rule 34 App needs to perform a contract with you</li>
          <li>You have given Rule 34 App permission to do so</li>
          <li>
            Processing your personal information is in Rule 34 App legitimate
            interests
          </li>
          <li>Rule 34 App needs to comply with the law</li>
        </ul>

        <!-- Space -->
        <br />

        <p>
          Rule 34 App will retain your personal information only for as long as
          is necessary for the purposes set out in this Privacy Policy. We will
          retain and use your information to the extent necessary to comply with
          our legal obligations, resolve disputes, and enforce our policies. Our
          Privacy Policy was generated with the help of
          <a href="https://www.gdprprivacynotice.com/"
            >GDPR Privacy Policy Generator</a
          >
          and the
          <a href="https://www.privacypolicygenerator.org"
            >Privacy Policy Generator</a
          >.
        </p>

        <!-- Space -->
        <br />

        <p>
          If you are a resident of the European Economic Area (EEA), you have
          certain data protection rights. If you wish to be informed what
          Personal Information we hold about you and if you want it to be
          removed from our systems, please contact us.
        </p>

        <!-- Space -->
        <br />

        <p>
          In certain circumstances, you have the following data protection
          rights:
        </p>
        <ul class="list-inside list-disc">
          <li>
            The right to access, update or to delete the information we have on
            you.
          </li>
          <li>The right of rectification.</li>
          <li>The right to object.</li>
          <li>The right of restriction.</li>
          <li>The right to data portability</li>
          <li>The right to withdraw consent</li>
        </ul>

        <!-- Space -->
        <br />

        <h2 class="text-lg">Log Files</h2>

        <p>
          Rule 34 App follows a standard procedure of using log files. These
          files log visitors when they visit websites. All hosting companies do
          this and a part of hosting services' analytics. The information
          collected by log files include internet protocol (IP) addresses,
          browser type, Internet Service Provider (ISP), date and time stamp,
          referring/exit pages, and possibly the number of clicks. These are not
          linked to any information that is personally identifiable. The purpose
          of the information is for analyzing trends, administering the site,
          tracking users' movement on the website, and gathering demographic
          information.
        </p>

        <!-- Space -->
        <br />

        <h2 class="text-lg">Cookies and Web Beacons</h2>

        <p>
          Like any other website, Rule 34 App uses 'cookies'. These cookies are
          used to store information including visitors' preferences, and the
          pages on the website that the visitor accessed or visited. The
          information is used to optimize the users' experience by customizing
          our web page content based on visitors' browser type and/or other
          information.
        </p>

        <!-- Space -->
        <br />

        <h2 class="text-lg">Privacy Policies</h2>

        <P
          >You may consult this list to find the Privacy Policy for each of the
          advertising partners of Rule 34 App.</P
        >

        <!-- Space -->
        <br />

        <p>
          Third-party ad servers or ad networks uses technologies like cookies,
          JavaScript, or Web Beacons that are used in their respective
          advertisements and links that appear on Rule 34 App, which are sent
          directly to users' browser. They automatically receive your IP address
          when this occurs. These technologies are used to measure the
          effectiveness of their advertising campaigns and/or to personalize the
          advertising content that you see on websites that you visit.
        </p>

        <!-- Space -->
        <br />

        <p>
          Note that Rule 34 App has no access to or control over these cookies
          that are used by third-party advertisers.
        </p>

        <!-- Space -->
        <br />
        <h2 class="text-lg">Third Party Privacy Policies</h2>

        <p>
          Rule 34 App's Privacy Policy does not apply to other advertisers or
          websites. Thus, we are advising you to consult the respective Privacy
          Policies of these third-party ad servers for more detailed
          information. It may include their practices and instructions about how
          to opt-out of certain options. You may find a complete list of these
          Privacy Policies and their links here: Privacy Policy Links.
        </p>

        <!-- Space -->
        <br />

        <p>
          You can choose to disable cookies through your individual browser
          options. To know more detailed information about cookie management
          with specific web browsers, it can be found at the browsers'
          respective websites. What Are Cookies?
        </p>

        <!-- Space -->
        <br />

        <h2 class="text-lg">Children's Information</h2>

        <p>
          Another part of our priority is adding protection for children while
          using the internet. We encourage parents and guardians to observe,
          participate in, and/or monitor and guide their online activity.
        </p>

        <!-- Space -->
        <br />

        <p>
          Rule 34 App does not knowingly collect any Personal Identifiable
          Information from children under the age of 13. If you think that your
          child provided this kind of information on our website, we strongly
          encourage you to contact us immediately and we will do our best
          efforts to promptly remove such information from our records.
        </p>

        <!-- Space -->
        <br />

        <h2 class="text-lg">Online Privacy Policy Only</h2>

        <p>
          Our Privacy Policy applies only to our online activities and is valid
          for visitors to our website with regards to the information that they
          shared and/or collect in Rule 34 App. This policy is not applicable to
          any information collected offline or via channels other than this
          website.
        </p>

        <!-- Space -->
        <br />

        <h2 class="text-lg">Consent</h2>

        <p>
          By using our website, you hereby consent to our Privacy Policy and
          agree to its terms.
        </p>
      </template>
    </ContentContainer>

    <!-- Thank you -->
    <ContentContainer
      title="Contact"
      text="Please reach me in the following email for suggestions, requests, questions, comments, or any concerns."
      icon="info"
      link="mailto:contact@r34.app"
      link-text="contact@r34.app"
    />

    <ContentContainer
      title="Thank you for your interest"
      text="It's a pleasure having someone read this wall of text :')"
      icon="star"
      @click.native="unlockExperimental()"
    />
  </main>
</template>

<script>
import { mapMutations } from 'vuex'
import ContentContainer from '~/components/faq/ContentContainer.vue'

export default {
  components: { ContentContainer },

  data() {
    return {
      clicks: 0,
    }
  },

  methods: {
    ...mapMutations(['experimentalManager', 'domainManager']),

    // Shh it's a secret!
    unlockExperimental() {
      if (this.clicks >= 7) {
        this.clicks = 0
        console.log('Experimental features enabled!')
        this.experimentalManager('enable')
      } else {
        this.clicks++
        console.log(this.clicks)
        // Reset to default domain
        this.domainManager('xxx/')
        // Disable features
        this.experimentalManager('disable')
      }
    },
  },

  head() {
    return {
      title: 'Legal | Rule 34 App',
      meta: [
        {
          hid: 'legal',
          name: 'description',
          content: 'Legal information about the Rule 34 App',
        },
      ],
    }
  },
}
</script>
