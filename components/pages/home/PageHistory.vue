<script lang="ts" setup>
  import { formatTimeAgo } from '@vueuse/core'
  import { toast } from 'vue-sonner'

  const { isPremium } = useUserData()
  const { pageHistory } = usePageHistory()

  function historyPathToTitle(path: string) {
    return (
      path
        //
        .replace('/posts?', '')
        .split('&')
        .join(', ')
        // Query separator
        .replace(/=/g, ': ')
        // Tag separator
        .replace(/%7C/g, ', ')
    )
  }

  function onHistoryItemClick(path: string) {
    if (!isPremium.value) {
      toast.error('[Premium feature] Page history is only available for Premium users')
      return
    }

    navigateTo(path)
  }
</script>

<template v-if="pageHistory.length">
  <PageHeader as="h3">
    <template #title>History</template>
    <template #text>Continue where you left off</template>
  </PageHeader>

  <ol
    class="space-y-6 overflow-x-hidden py-2"
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
        <div class="w-px bg-base-0/20" />
      </div>

      <!-- Icon (dot) -->
      <div class="relative flex h-6 w-6 flex-none items-center justify-center bg-base-1000">
        <div class="h-1.5 w-1.5 rounded-full bg-base-0/10 ring-1 ring-base-0/20" />
      </div>

      <!-- Text -->
      <button
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util flex-auto rounded-md px-1 py-0.5 text-left text-xs leading-5"
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
    </li>
  </ol>
</template>