<script lang="ts" setup>
  import { BookmarkIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <button
    class="hover:hover-bg-util focus-visible:focus-outline-util group rounded-md px-1.5 py-1"
    type="button"
  >
    <span class="sr-only"> Save post </span>

    <BookmarkIcon class="group-hover:hover-text-util h-5 w-5 text-base-content" />
  </button>
</template>
