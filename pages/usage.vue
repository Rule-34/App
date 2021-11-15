<template>
  <main class="max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <div class="space-y-4">
      <!-- Navigation -->

      <ContentSeparator title="Navigation" />

      <ContentContainer
        text="The `back` button on your browser/device is respected and allows you to go back to a past domain, page or tag."
        title="Back"
      />

      <ContentContainer
        img="/img/usage_examples/keyboard-controls"
        text="Keyboard's `right` and `left` arrows will navigate pages similar to clicking the page controls buttons."
        title="Keyboard page controls"
      />

      <!-- General Usage -->
      <ContentSeparator title="Search" />

      <ContentContainer
        img="/img/usage_examples/search-delete"
        text="Deletes all added tags."
        title="Trash button"
      />

      <ContentContainer
        img="/img/usage_examples/search-filter"
        text="Toggling the filter will ban from appearing the next added tags."
        title="Filter button"
      />

      <!-- User Settings -->
      <ContentSeparator title="User settings" />

      <!-- Recursion for every setting -->
      <ContentContainer
        v-for="setting in getUserSettings"
        :key="setting.name"
        :img="setting.image"
        :text="setting.description"
        :title="setting.name"
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
          content: 'How to use some features.',
        },
      ],
    }
  },

  computed: {
    ...mapGetters('user', ['getUserSettings']),
  },
}
</script>
