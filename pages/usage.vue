<template>
  <div>
    <div class="cool-bar" />
    <SideNav :show-search="false" />
    <div class="card-container md:w-2/3 xl:w-1/2">
      <!-- Examples -->
      <ContentContainer
        title="Explained settings"
        text="All user settings of this PWA are explained below"
      />

      <ContentContainer
        title="Full size images"
        text="While activated, images will be higher resolution, consuming more data."
        img="/img/examples/fullsize.png"
      />

      <ContentContainer
        title="Hover Controls"
        text="While activated, controls will hover over content."
        img="/img/examples/controls.png"
      />

      <ContentContainer
        title="Hover Zoom"
        text="While activated, posts hovered will enlarge."
        img="/img/examples/zoom.png"
      />

      <ContentContainer title="NSFW" img="/img/examples/nsfw.png">
        <!-- Slot -->
        <template slot="textRich">
          <p>While <u>deactivated</u>, posts will be blurred</p>
        </template>
      </ContentContainer>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import SideNav from "~/components/navigation/SideNav.vue";
import ContentContainer from "~/components/faq/ContentContainer.vue";

export default {
  components: { SideNav, ContentContainer },
  computed: mapState(["userSettings"])
};
</script>
