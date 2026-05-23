<script lang="ts" setup>
  import { ShareIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <button
    :aria-label="$t('common.sharePage')"
    class="rounded-md px-1.5 py-1"
    disabled
    tabindex="-1"
    type="button"
  >
    <ShareIcon
      aria-hidden="true"
      class="h-5 w-5 text-base-content"
    />
  </button>
</template>
