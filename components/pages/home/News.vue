<script lang="ts" setup>
  import { project } from '@/config/project'

  const { t } = useI18n()

  const newsList = computed(() => [
    {
      name: t('news.feedbackWebsiteTitle'),
      text: t('news.feedbackWebsiteText', { name: project.name }),
      links: [
        {
          text: `feedback.${project.urls.production.hostname}`,
          href: `https://feedback.${project.urls.production.hostname}`,
          target: '_blank'
        }
      ]
    },
    {
      name: t('news.blockedTitle'),
      text: t('news.blockedText', { name: project.name }),
      links: [
        {
          text: `alt4.${project.urls.production.hostname}`,
          href: `https://alt4.${project.urls.production.hostname}`,
          target: '_blank'
        }
      ]
    },
    {
      name: t('news.socialTitle'),
      text: t('news.socialText'),
      links: [
        {
          text: 'Twitter',
          href: project.social.twitter
        },
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
  ])
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
