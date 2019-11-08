<template>
  <div>
    <div class="cool-bar" />
    <SideNav :show-search="false" />
    <div class="card-container md:w-2/3 xl:w-1/2">
      <!-- What is this -->
      <FaqContainer
        title="What is this?"
        text="This is a Progressive Web App, essentially a installable web page, that acts as a client for rule34.xxx,
        This means that it gets the images and displays them, nothing is stored in any server."
      >
        <!-- Slot -->
        <small class="text-gray-500"
          >If you're the owner of rule34.xxx and want to cease this PWA please
          go to GitHub and leave an issue</small
        >
      </FaqContainer>

      <!-- Copyright -->
      <FaqContainer
        title="Do you own the media content?"
        text="No, the images/videos/media are directly served from rule34.xxx so I do not own anything."
      >
      </FaqContainer>

      <!-- Github -->
      <FaqContainer
        title="Can I report an error?"
        text="Yes, you can report any error that you may find or suggest something you want to be added in the next link."
      >
        <!-- Slot -->
        <a
          href="https://github.com/VoidlessSeven7/Rule-34-PWA-Public"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub</a
        >
      </FaqContainer>

      <!-- Analytics -->
      <FaqContainer
        title="Analytics"
        text="Analytics are used and they respect your privacy: all information is anonymized and follows the 'Do not track' directive, so if you dont want to be tracked, you wont."
      >
        <!-- Slot -->
        <a
          href="https://getinsights.io/"
          target="_blank"
          rel="noopener noreferrer"
          >Check the analytics platform</a
        >
      </FaqContainer>

      <!-- Donations -->
      <!-- TODO: poner estrellita azul -->
      <FaqContainer
        title="Can I donate for your efforts?"
        icon="donation"
        text="Yes! I've been working really hard on this PWA, I really appreciate every donation."
      >
        <!-- Slot -->
        <a
          href="https://www.paypal.me/Alejandrorr7"
          target="_blank"
          rel="noopener noreferrer"
          >Paypal</a
        >
      </FaqContainer>

      <!-- Credits -->
      <!-- TODO: poner estrellita amarilla -->
      <FaqContainer
        title="Credits"
        icon="star"
        text="Thanks to Jessica for drawing the logo, and me for programming the PWA."
      >
        <!-- Slot -->
        <small class="text-gray-500">And you, the user!</small>
      </FaqContainer>
    </div>
  </div>
</template>

<script>
import SideNav from "~/components/navigation/SideNav.vue";
import FaqContainer from "~/components/faq/FaqContainer.vue";

export default {
  components: { SideNav, FaqContainer }
};
</script>
