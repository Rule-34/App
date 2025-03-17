<script lang="ts" setup>
  import { PencilSquareIcon } from '@heroicons/vue/24/outline'

  function handleClick(event: Event) {
    window.open('https://feedback.r34.app', '_blank')
  }
</script>

<template>
  <div class="fixed right-[1dvw] bottom-1/2">
    <div class="flex flex-col items-center justify-center gap-2">
      <NuxtLink
        @click.prevent.stop="handleClick"
        @touchend.prevent.stop="handleClick"
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util bg-base-1000 ring-base-0/15 flex items-center justify-center gap-2 rounded-r-md p-2 ring-1"
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
