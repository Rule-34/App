<template>
  <main>
    <!-- Examples -->
    <ContentContainer
      :separator="true"
      title="General usage"
      text="Normal usage of the PWA is explained below"
    />

    <ContentContainer title="Touch navigation">
      <template slot="extra">
        On devices with touch support, swiping <u>right</u> will open the menu,
        and swiping <u>left</u> will open the search.
      </template>
    </ContentContainer>

    <ContentContainer
      title="Search: remove tags"
      text="This button toggles between states, first state will delete all added tags."
      img="/img/examples/search_delete"
    />

    <ContentContainer
      title="Search: premade filter"
      text="Second state will fetch a dynamic filter that applies tags that will ban unpleasant posts from showing."
      img="/img/examples/search_premade_filter"
    />

    <ContentContainer
      title="Search: filter content"
      text="Toggling the filter will ban from appearing the next clicked tags."
      img="/img/examples/search_filter"
    />

    <ContentContainer
      :separator="true"
      title="User settings"
      text="Customizable settings are explained below"
    />

    <ContentContainer
      :title="userSettings.keyboardControls.name"
      :text="userSettings.keyboardControls.description"
      img="/img/examples/navigation"
    />

    <ContentContainer
      :title="userSettings.hoverControls.name"
      :text="userSettings.hoverControls.description"
      img="/img/examples/controls"
    />

    <ContentContainer
      :title="userSettings.videoControls.name"
      :text="userSettings.videoControls.description"
      img="/img/examples/video_controls"
    />

    <ContentContainer
      :title="userSettings.zoom.name"
      :text="userSettings.zoom.description"
      img="/img/examples/zoom"
    />

    <ContentContainer
      :title="userSettings.lazyLoading.name"
      :text="userSettings.lazyLoading.description"
    />

    <ContentContainer
      :title="userSettings.fullSizeImages.name"
      :text="userSettings.fullSizeImages.description"
      img="/img/examples/fullsize"
    />

    <ContentContainer
      :title="userSettings.infiniteLoad.name"
      :text="userSettings.infiniteLoad.description"
    />

    <ContentContainer
      :title="userSettings.postsPerPage.name"
      :text="userSettings.postsPerPage.description"
    />

    <ContentContainer
      :title="userSettings.score.name"
      :text="userSettings.score.description"
    />

    <ContentContainer
      :title="userSettings.imgRetry.name"
      :text="userSettings.imgRetry.description"
    />

    <ContentContainer
      :title="userSettings.performance.name"
      :text="userSettings.performance.description"
    />

    <ContentContainer
      title="NSFW"
      text="While not active, posts will be blurred."
      img="/img/examples/nsfw"
    />
  </main>
</template>

<script>
import { mapState } from 'vuex'
// Components
import ContentContainer from '~/components/content/ContentContainer.vue'

export default {
  components: { ContentContainer },

  computed: {
    ...mapState(['userSettings'])
  },

  head() {
    return {
      title: 'Usage',
      meta: [
        {
          hid: 'usage',
          name: 'description',
          content: 'Learn what the Rule 34 App offers'
        }
      ]
    }
  }
}
</script>
