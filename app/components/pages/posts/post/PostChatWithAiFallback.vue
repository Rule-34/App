<script lang="ts" setup>
  import { SparklesIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <button
    :aria-label="$t('common.chatWithAi')"
    class="flex items-center gap-1 rounded-md px-1.5 py-1"
    disabled
    tabindex="-1"
    type="button"
  >
    <SparklesIcon
      aria-hidden="true"
      class="h-5 w-5 text-base-content"
    />

    <span class="text-sm font-medium text-base-content">AI</span>
  </button>
</template>
