<template>
  <ContentContainer
    title="Support us!"
    text="Looks like you're enjoying the App, do you mind supporting the project with a donation?

Or even better, subscribe to unlock Premium features!"
    :links="[
      {
        href: 'https://redirect.r34.app/donations',
        text: 'Donation'
      },
      { href: '/premium', text: 'Subscription', isInternal: true }
    ]"
  />
</template>
