<template>
  <div>
    <div class="cool-bar" />
    <SideNav :show-search="false" />
    <div class="card-container md:w-2/3 xl:w-1/2">
      <!-- What is this -->
      <ContentContainer
        title="What is this?"
        text="This is a Progressive Web App, essentially a installable web page, that acts as a client for rule34.xxx,
This means that it gets the images from a official Api wrapper and displays them, nothing is stored in any server."
        icon="info"
      >
        <!-- Slot -->
        <small class="text-gray-500"
          >If you're the owner of rule34.xxx and want to cease this PWA please
          go to GitHub and leave an issue.</small
        >
      </ContentContainer>

      <!-- Copyright -->
      <ContentContainer
        title="Do you own the media content?"
        text="No, the images/videos/media are directly served from rule34.xxx so I do not own anything."
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
        text="Yes, you can report any error that you may find or suggest something you want to be added in the next link."
        icon="info"
        link="https://github.com/VoidlessSeven7/Rule-34-PWA-Public"
        link-text="GitHub"
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
        text="Analytics are used and they respect your privacy:
All information is anonymized and respects the 'Do not track' directive, so if you dont want to be tracked, you wont."
        icon="info"
        link="https://getinsights.io/"
        link-text="Check the analytics platform"
      />

      <!-- Donations -->
      <!-- TODO: poner estrellita azul -->
      <ContentContainer
        title="Can I donate for your efforts?"
        text="Yes! I've been working really hard on this PWA, I really appreciate every donation."
        icon="donation"
        link="https://www.paypal.me/Alejandrorr7"
        link-text="Paypal"
      />

      <!-- Credits -->
      <!-- TODO: poner estrellita amarilla -->
      <ContentContainer
        title="Credits"
        text="Thanks to Jessica for drawing the logo, and me for programming the PWA."
        icon="star"
      >
        <!-- Slot -->
        <small class="text-gray-500">And you, the user!</small>
      </ContentContainer>
    </div>
  </div>
</template>

<script>
import SideNav from "~/components/navigation/SideNav.vue";
import ContentContainer from "~/components/faq/ContentContainer.vue";

export default {
  components: { SideNav, ContentContainer }
};
</script>
