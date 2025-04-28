<script lang="ts" setup>
  import { BookmarkIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <button
    aria-label="Save post"
    class="hover:hover-bg-util focus-visible:focus-outline-util group rounded-md px-1.5 py-1"
    type="button"
  >
    <BookmarkIcon class="group-hover:hover-text-util text-base-content h-5 w-5" />
  </button>
</template>
