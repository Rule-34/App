<script lang="ts" setup>
  import { XMarkIcon } from '@heroicons/vue/20/solid'
  import { project } from '~~/config/project'

  const localePath = useLocalePath()
  const { t, locale } = useI18n()
  const { isPremium } = useUserData()
  const { pageHistory } = usePageHistory()

  const relativeTimeFormatter = computed(() => new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' }))
  const sortValueKeys = {
    score: 'filters.sortByScore',
    id: 'filters.sortByCreated',
    random: 'filters.sortByRandom'
  } as const
  const ratingValueKeys = {
    safe: 'filters.ratingSafe',
    general: 'filters.ratingGeneral',
    sensitive: 'filters.ratingSensitive',
    questionable: 'filters.ratingQuestionable',
    explicit: 'filters.ratingExplicit'
  } as const
  const relativeTimeUnits: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
    { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: 'day', ms: 1000 * 60 * 60 * 24 },
    { unit: 'hour', ms: 1000 * 60 * 60 },
    { unit: 'minute', ms: 1000 * 60 },
    { unit: 'second', ms: 1000 }
  ]

  function mappedTranslationKey<T extends Record<string, string>>(map: T, key: string) {
    return map[key as keyof T] ?? key
  }

  function historyPathToTitle(path: string) {
    const url = URL.parse(path, project.urls.production.href)

    if (!url) {
      return `${t('common.domain')}: ${path}`
    }

    const lines = [`${t('common.domain')}: ${url.pathname.replace(/^\/posts\//, '')}`]
    const page = url.searchParams.get('page')
    const tags = url.searchParams.get('tags')
    const sort = url.searchParams.get('filter[sort]')
    const rating = url.searchParams.get('filter[rating]')
    const score = url.searchParams.get('filter[score]')

    if (page) {
      lines.push(`${t('common.page')}: ${page}`)
    }

    if (tags) {
      lines.push(`${t('common.tags')}: ${tags.replace(/\|/g, ', ')}`)
    }

    if (sort) {
      lines.push(`${t('filters.sort')}: ${t(mappedTranslationKey(sortValueKeys, sort))}`)
    }

    if (rating) {
      lines.push(`${t('filters.rating')}: ${t(mappedTranslationKey(ratingValueKeys, rating))}`)
    }

    if (score) {
      lines.push(`${t('filters.score')}: ${score}`)
    }

    return lines.join('\n')
  }

  function historyDateToRelativeTime(date: Date | string) {
    const timestamp = new Date(date).getTime()

    if (!Number.isFinite(timestamp)) {
      return ''
    }

    const elapsed = timestamp - Date.now()

    for (const { unit, ms } of relativeTimeUnits) {
      if (Math.abs(elapsed) >= ms || unit === 'second') {
        return relativeTimeFormatter.value.format(Math.round(elapsed / ms), unit)
      }
    }

    return ''
  }

  function historyDateToISOString(date: Date | string) {
    return new Date(date).toISOString()
  }

  function onHistoryItemClick(path: string) {
    if (!isPremium.value) {
      const { open: promptPremium, currentIndex } = usePremiumDialog()

      currentIndex.value = 3
      promptPremium.value = true
      return
    }

    navigateTo(localePath(path))
  }

  function removeHistoryItem(path: string) {
    pageHistory.value = pageHistory.value.filter((historyItem) => historyItem.path !== path)
  }
</script>

<template>
  <ol
    class="space-y-6 overflow-x-hidden"
    role="list"
  >
    <li
      v-for="(historyItem, index) in pageHistory.slice().reverse()"
      :key="index"
      class="relative flex gap-x-4"
    >
      <!-- Left Axis -->
      <div
        :class="[
          index === pageHistory.length - 1 ? 'h-6' : '-bottom-6',
          'absolute top-0 left-0 flex w-6 justify-center'
        ]"
      >
        <div class="w-px bg-base-0/20" />
      </div>

      <!-- Icon (dot) -->
      <div class="relative flex h-6 w-6 flex-none items-center justify-center bg-base-1000">
        <div class="h-1.5 w-1.5 rounded-full bg-base-0/10 ring-1 ring-base-0/20" />
      </div>

      <!-- Text -->
      <button
        class="flex-auto rounded-md px-1 py-0.5 text-left text-xs leading-5 whitespace-pre-wrap hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="onHistoryItemClick(historyItem.path)"
      >
        {{ historyPathToTitle(historyItem.path) }}
      </button>

      <time
        :datetime="historyDateToISOString(historyItem.date)"
        class="flex-none py-0.5 text-xs leading-5"
      >
        {{ historyDateToRelativeTime(historyItem.date) }}
      </time>

      <button
        :aria-label="$t('common.removeHistoryItem')"
        class="h-fit max-h-fit rounded-md px-1 py-0.5 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="removeHistoryItem(historyItem.path)"
      >
        <XMarkIcon
          aria-hidden="true"
          class="h-5 w-5"
        />
      </button>
    </li>
  </ol>
</template>
