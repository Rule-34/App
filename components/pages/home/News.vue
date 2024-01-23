<script lang="ts" setup>
  const newsList = [
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
    },
    {
      name: 'We are open source',
      text: 'Check out and contribute to our source code',
      links: [
        {
          text: 'GitHub',
          href: 'https://redirect.r34.app/github',
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
