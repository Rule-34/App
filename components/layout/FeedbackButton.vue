<script lang="ts" setup>
  import { PencilSquareIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="fixed bottom-1/2 right-2.5">
    <div class="flex flex-col items-center justify-center gap-2">
      <NuxtLink
        class="focus-visible:focus-util hover:hover-text-util hover:hover-bg-util flex items-center justify-center gap-2 rounded-r-md bg-base-1000/60 px-0.5 py-2 shadow-lg ring-1 ring-base-0/10 backdrop-blur"
        style="writing-mode: vertical-lr; transform: rotate(180deg)"
        target="_blank"
        to="https://forms.gle/sghxKkEgaGVpp81b9"
      >
        <span class="text-sm"> Feedback </span>

        <PencilSquareIcon
          class="h-4 w-4"
          style="transform: rotate(180deg)"
        />
      </NuxtLink>
    </div>
  </div>
</template>
