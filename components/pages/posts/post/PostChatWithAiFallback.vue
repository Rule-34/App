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
      class="text-base-content h-5 w-5"
    />

    <span class="text-base-content text-sm font-medium">AI</span>
  </button>
</template>
