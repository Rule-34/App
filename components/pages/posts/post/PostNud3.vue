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
    <SparklesIcon aria-hidden="true" class="h-5 w-5 text-[#F0489C] group-hover:text-[#BD2671]" />
    <span class="text-xs font-bold text-[#F0489C] group-hover:text-[#BD2671]">AI Video</span>
  </a>
</template>
