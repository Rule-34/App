<script lang="ts" setup>
  import { ChevronDownIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <button
    class="ml-auto flex items-center gap-1 rounded-md px-1.5 py-1"
    disabled
    tabindex="-1"
    type="button"
  >
    <span class="text-sm text-base-content">{{ $t('common.tags') }}</span>

    <ChevronDownIcon
      aria-hidden="true"
      class="h-5 w-5 text-base-content"
    />
  </button>
</template>
