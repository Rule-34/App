<script lang="ts" setup>
  import { PencilSquareIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="fixed bottom-1/2 right-0">
    <div class="flex flex-col items-center justify-center gap-2">
      <NuxtLink
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util flex items-center justify-center gap-2 rounded-r-md bg-base-1000 px-1 py-2 ring-1 ring-base-0/15"
        rel="nofollow noopener noreferrer"
        style="writing-mode: vertical-lr; transform: rotate(180deg)"
        target="_blank"
        to="https://feedback.r34.app"
      >
        <span class="text-base font-medium"> Feedback </span>

        <PencilSquareIcon
          class="h-5 w-5"
          style="transform: rotate(180deg)"
        />
      </NuxtLink>
    </div>
  </div>
</template>
