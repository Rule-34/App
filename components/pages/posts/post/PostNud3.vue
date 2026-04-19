<script lang="ts" setup>
  import { SparklesIcon } from '@heroicons/vue/24/outline'

  const props = defineProps({
    mediaUrl: {
      type: String,
      required: true
    }
  })
</script>

<template>
  <a
    aria-label="Generate AI Video"
    title="Generate AI Video"
    class="hover:hover-bg-util focus-visible:focus-outline-util group flex items-center gap-1 rounded-md px-1.5 py-1"
    :href="`https://nud3.me/pornify?imageUrl=${encodeURIComponent(mediaUrl)}&r=r34`"
    target="_blank"
    rel="noopener noreferrer"
  >
    <SparklesIcon aria-hidden="true" class="group-hover:hover-text-util text-base-content h-5 w-5" />
    <span class="group-hover:hover-text-util text-base-content text-xs font-bold">AI</span>
  </a>
</template>
