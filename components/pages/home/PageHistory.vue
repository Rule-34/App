<script lang="ts" setup>
import {formatTimeAgo} from '@vueuse/core'
import {toast} from 'vue-sonner'
import {XMarkIcon} from '@heroicons/vue/20/solid'

const {isPremium} = useUserData()
const {pageHistory} = usePageHistory()

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
    toast.info('Premium feature', {
      description: 'Page history is only available for Premium users',
      action: {
        label: 'Subscribe',
        onClick: () => navigateTo('/premium?utm_source=web&utm_medium=page-history')
      }
    })
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
          'absolute left-0 top-0 flex w-6 justify-center'
        ]"
      >
        <div class="w-px bg-base-0/20"/>
      </div>

      <!-- Icon (dot) -->
      <div class="relative flex h-6 w-6 flex-none items-center justify-center bg-base-1000">
        <div class="h-1.5 w-1.5 rounded-full bg-base-0/10 ring-1 ring-base-0/20"/>
      </div>

      <!-- Text -->
      <button
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util flex-auto whitespace-pre-wrap rounded-md px-1 py-0.5 text-left text-xs leading-5"
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
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util h-fit max-h-fit rounded-md px-1 py-0.5"
        type="button"
        @click="removeHistoryItem(historyItem.path)"
      >
        <XMarkIcon class="h-5 w-5"/>
      </button>
    </li>
  </ol>
</template>
