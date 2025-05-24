<script lang="ts" setup>
  import { project } from '@/config/project'

  const newsList = [
    {
      name: 'Feedback website',
      text: `Now you can vote, discuss and share ideas 💡 to improve ${project.name}`,
      links: [
        {
          text: `feedback.${project.urls.production.hostname}`,
          href: `https://feedback.${project.urls.production.hostname}`,
          target: '_blank'
        }
      ]
    },
    {
      name: 'Blocked in your country? 🇷🇺',
      text: `Access ${project.name} without restrictions, with the alternative site`,
      links: [
        {
          text: `alt3.${project.urls.production.hostname}`,
          href: `https://alt3.${project.urls.production.hostname}`,
          target: '_blank'
        }
      ]
    },
    {
      name: 'Get the best Hentai on social media! 📱',
      text: "We're on Bluesky, Mastodon and Telegram",
      links: [
        {
          text: 'Bluesky',
          href: 'https://bsky.app/profile/r34app.bsky.social'
        },
        {
          text: 'Mastodon',
          href: 'https://mastodon.social/@r34'
        },
        {
          text: 'Lemmy',
          href: 'https://lemmynsfw.com/c/r34'
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
