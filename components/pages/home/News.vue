<script lang="ts" setup>
  const newsList = [
    {
      name: 'Farewell, redirecting ads!',
      text:
        "To improve your experience, I've removed all 3rd party ads." +
        '\nHowever, maintaining and developing this project takes resources. As the sole developer, I rely on your support. ' +
        'Consider subscribing to the Premium version for an ad-free experience and exclusive features',
      links: [
        {
          text: 'Premium',
          href: '/premium?utm_source=web&utm_medium=news'
        }
      ]
    },
    {
      name: 'Install the App',
      text: 'Learn how to install the Rule 34 App on your device, in 3 simple steps',
      links: [
        {
          text: 'Install the App',
          href: 'https://www.installpwa.com/from/r34.app',
          target: '_blank'
        }
      ]
    },
    {
      name: 'Social media Bots',
      text: 'Enjoy the best hentai anywhere and anytime',
      links: [
        // {
        //   text: 'Twitter',
        //   href: 'https://twitter.com/Rule34_Pokebot',
        //   target: '_blank'
        // },
        {
          text: 'Telegram',
          href: 'https://t.me/Rule_34_Hentai',
          target: '_blank'
        },
        {
          text: 'Mastodon',
          href: 'https://mastodon.social/@r34',
          target: '_blank'
        }
      ]
    }
  ]
</script>

<template>
  <ol class="space-y-4">
    <li
      v-for="news in newsList"
      :key="news.name"
    >
      <ContentContainer
        :links="news.links"
        :text="news.text"
        :title="news.name"
        as="h3"
      />
    </li>
  </ol>
</template>
