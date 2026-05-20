<script lang="ts" setup>
  import { BookmarkIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <button
    :aria-label="$t('common.savePost')"
    class="rounded-md px-1.5 py-1"
    disabled
    tabindex="-1"
    type="button"
  >
    <BookmarkIcon
      aria-hidden="true"
      class="text-base-content h-5 w-5"
    />
  </button>
</template>
