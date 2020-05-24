<template>
  <main>
    <!-- General Usage -->

    <ContentContainer
      :separator="true"
      title="General usage"
      text="Normal usage of the PWA is explained below"
    />

    <ContentContainer
      title="Touch navigation"
      text="Devices with touch support can swipe right to open the navigation menu, and left to open the search menu."
    />

    <ContentContainer
      title="Search: Furry button"
      text="Fetch a dynamic filter that applies tags that will ban unpleasant posts from showing (Only for rule34.xxx)."
      img="/img/usage_examples/search-premade-filter"
    />

    <ContentContainer
      title="Search: Trash button"
      text="Deletes all added tags."
      img="/img/usage_examples/search-delete"
    />

    <ContentContainer
      title="Search: Filter button"
      text="Toggling the filter will ban from appearing the next added tags."
      img="/img/usage_examples/search-filter"
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
import ContentContainer from '~/components/utils/ContentContainer.vue'

export default {
  components: { ContentContainer },

  computed: {
    ...mapState(['userSettings']),
  },

  head() {
    return {
      title: 'Usage',
      meta: [
        {
          hid: 'usage',
          name: 'description',
          content: 'Learn what every setting in the the Rule 34 App does.',
        },
      ],
    }
  },
}
</script>
