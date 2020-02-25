<template>
  <main>
    <!-- General Usage -->

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
      img="/img/examples/search-delete"
    />

    <ContentContainer
      title="Search: premade filter"
      text="Second state will fetch a dynamic filter that applies tags that will ban unpleasant posts from showing."
      img="/img/examples/search-premade-filter"
    />

    <ContentContainer
      title="Search: filter content"
      text="Toggling the filter will ban from appearing the next clicked tags."
      img="/img/examples/search-filter"
    />

    <!-- User Settings -->

    <ContentContainer
      :separator="true"
      title="User settings"
      text="Customizable settings are explained below"
    />

    <!-- Recursion for every setting -->

    <ContentContainer
      v-for="setting in userSettings"
      :key="setting.name"
      :title="setting.name"
      :text="setting.description"
      :img="setting.image"
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
