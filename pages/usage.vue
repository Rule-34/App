<template>
  <main class="space-y-4 space-y-4-fixer">
    <!-- Navigation -->

    <ContentContainer :separator="true" title="Navigation" />

    <ContentContainer
      title="Touch navigation"
      text="Devices with touch support can swipe `right` to open the navigation menu, and `left` to open the search menu."
    />

    <ContentContainer
      title="Keyboard controls"
      text="Keyboard's `right` and `left` arrows will navigate pages similar to clicking the control's buttons."
      img="/img/usage_examples/keyboard-controls"
    />

    <!-- General Usage -->

    <ContentContainer
      :separator="true"
      title="Search"
      text="Normal usage of the PWA is explained below"
    />

    <ContentContainer
      title="Trash button"
      text="Deletes all added tags."
      img="/img/usage_examples/search-delete"
    />

    <ContentContainer
      title="Filter button"
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
      v-for="setting in getUserSettings"
      :key="setting.name"
      :title="setting.name"
      :text="setting.description"
      :img="setting.image"
    />
  </main>
</template>

<script>
import { mapGetters } from 'vuex'
// Components
import ContentContainer from '~/components/utils/ContentContainer.vue'

export default {
  components: { ContentContainer },

  computed: {
    ...mapGetters('user', ['getUserSettings']),
  },

  head() {
    return {
      title: 'Usage',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Learn how to use App',
        },
      ],
    }
  },
}
</script>
