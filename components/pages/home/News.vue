<script lang="ts" setup>
  const newsList = [
    {
      name: 'Feedback website',
      text: 'Now you can vote, discuss and share ideas 💡 to improve the Rule 34 App',
      links: [
        {
          text: 'feedback.r34.app',
          href: 'https://feedback.r34.app',
          target: '_blank'
        }
      ]
    },
    {
      name: 'Blocked in your country? 🇷🇺',
      text: 'Access the Rule 34 App without restrictions, with the alternative site',
      links: [
        {
          text: 'alt3.r34.app',
          href: 'https://alt3.r34.app',
          target: '_blank'
        }
      ]
    },
    {
      name: 'Get the best Hentai on social media! 📱',
      text: "We're on Mastodon and Telegram",
      links: [
        {
          text: 'Mastodon',
          href: 'https://mastodon.social/@r34'
        },
        {
          text: 'Telegram',
          href: 'https://t.me/Rule_34_Hentai'
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
