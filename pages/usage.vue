<template>
  <main class="max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <div class="space-y-4">
      <!-- Navigation -->

      <ContentSeparator title="Navigation" />

      <ContentContainer
        title="Back"
        text="The `back` button on your browser/device is respected and allows you to go back to a past domain, page or tag."
      />

      <ContentContainer
        title="Touch navigation"
        text="Devices with touch support can swipe `left-to-right` to open the navigation menu, and `right-to-left` to open the search menu."
      />

      <ContentContainer
        title="Keyboard page controls"
        text="Keyboard's `right` and `left` arrows will navigate pages similar to clicking the page controls buttons."
        img="/img/usage_examples/keyboard-controls"
      />

      <!-- General Usage -->
      <ContentSeparator title="Search" />

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
      <ContentSeparator title="User settings" />

      <!-- Recursion for every setting -->
      <ContentContainer
        v-for="setting in getUserSettings"
        :key="setting.name"
        :title="setting.name"
        :text="setting.description"
        :img="setting.image"
      />
    </div>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
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

  computed: {
    ...mapGetters('user', ['getUserSettings']),
  },
}
</script>
