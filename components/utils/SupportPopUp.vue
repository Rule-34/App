<template>
  <div class="flex" @click.self.stop="toggleSupportPopUp()">
    <div class="px-2 m-auto md:px-0">
      <ContentContainer
        title="Support us!"
        text="Looks like you're enjoying the App, do you mind supporting this project with a donation?

Or even better, subscribe to unlock new features!"
        :links="[
          { href: 'https://redirect.r34.app/liberapay', text: 'Donation' },
          { href: '/premium', text: 'Subscription' },
        ]"
      />
    </div>
  </div>
</template>

<script>
import ContentContainer from '~/components/utils/ContentContainer.vue'

export default {
  components: { ContentContainer },

  methods: {
    toggleSupportPopUp() {
      this.$emit('toggleSupportPopUp')
    },
  },
}
</script>
