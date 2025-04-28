<script lang="ts" setup>
  import { formatTimeAgo } from '@vueuse/core'
  import { XMarkIcon } from '@heroicons/vue/20/solid'

  const { isPremium } = useUserData()
  const { pageHistory } = usePageHistory()

  function historyPathToTitle(path: string) {
    path = decodeURIComponent(path)

    return (
      path
        //
        .replace('/posts/', 'domain: ')
        .replace('?', '&')
        .split('&')
        .map(
          (_query) =>
            _query
              // Capitalize first character
              .charAt(0)
              .toUpperCase() +
            _query
              .slice(1)

              // Replace first '=' with ': '
              .replace(/=/, ': ')
        )
        // Query separator
        .join('\n')
        // Separate tags
        .replace(/\|/g, ', ')
    )
  }

  function onHistoryItemClick(path: string) {
    if (!isPremium.value) {
      const { open: promptPremium, currentIndex } = usePremiumDialog()

      currentIndex.value = 3
      promptPremium.value = true
      return
    }

    navigateTo(path)
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
        <div class="bg-base-0/20 w-px" />
      </div>

      <!-- Icon (dot) -->
      <div class="bg-base-1000 relative flex h-6 w-6 flex-none items-center justify-center">
        <div class="bg-base-0/10 ring-base-0/20 h-1.5 w-1.5 rounded-full ring-1" />
      </div>

      <!-- Text -->
      <button
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util flex-auto rounded-md px-1 py-0.5 text-left text-xs leading-5 whitespace-pre-wrap"
        type="button"
        @click="onHistoryItemClick(historyItem.path)"
      >
        {{ historyPathToTitle(historyItem.path) }}
      </button>

      <time
        :datetime="historyItem.date"
        class="flex-none py-0.5 text-xs leading-5"
      >
        {{ formatTimeAgo(new Date(historyItem.date)) }}
      </time>

      <button
        aria-label="Remove this history item"
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util h-fit max-h-fit rounded-md px-1 py-0.5"
        type="button"
        @click="removeHistoryItem(historyItem.path)"
      >
        <XMarkIcon aria-hidden="true" class="h-5 w-5" />
      </button>
    </li>
  </ol>
</template>
