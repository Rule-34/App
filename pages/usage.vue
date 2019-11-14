<template>
  <div>
    <div class="cool-bar" />
    <SideNav :show-search="false" />
    <div class="container md:w-2/3 xl:w-1/2">
      <!-- Examples -->
      <ContentContainer
        title="General usage"
        text="Normal usage of the PWA is explained below"
        :separator="true"
      />

      <ContentContainer
        title="Search"
        text="When searching, toggling the filter button will ban from appearing the next clicked tags."
        img="/img/examples/filter"
      />

      <ContentContainer
        title="User settings"
        text="Customizable settings are explained below"
        :separator="true"
      />

      <ContentContainer
        title="Full size images"
        text="While activated, images will be higher resolution, consuming more data."
        img="/img/examples/fullsize"
      />

      <ContentContainer
        title="Minimum score"
        text="Sets the required score for a post to show. Set to 0 to deactivate"
      />

      <ContentContainer
        title="Video controls"
        text="While activated, videos will have controls, but clicking it won't show tags."
        img="/img/examples/video_controls"
      />

      <ContentContainer
        title="Hover Controls"
        text="While activated, controls will hover over content."
        img="/img/examples/controls"
      />

      <ContentContainer
        title="Keyboard navigation"
        text="While active, keyboard's right and left arrows will navigate like clicking the control's buttons."
        img="/img/examples/navigation"
      />

      <ContentContainer
        title="Hover Zoom"
        text="While activated, posts hovered will enlarge."
        img="/img/examples/zoom"
      />

      <ContentContainer title="NSFW" img="/img/examples/nsfw">
        <!-- Slot -->
        <template slot="textRich">
          <p>While <u>deactivated</u>, posts will be blurred.</p>
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
