<template>
  <div class="flex" @click.self.stop="toggleSupportPopUp">
    <div class="px-2 m-auto md:px-0">
      <ContentContainer
        title="Support us!"
        text="Looks like you're enjoying the App, do you mind supporting the project with a donation?

Or even better, subscribe to unlock Premium features!"
        :links="[
          {
            href: 'https://redirect.r34.app/donations',
            text: 'Donation',
          },
          { href: '/premium', text: 'Subscription', isInternal: true },
        ]"
      />
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    toggleSupportPopUp() {
      this.$emit('toggleSupportPopUp')
    },
  },
}
</script>
