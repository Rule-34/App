<script lang="ts" setup>
  import { EnvelopeIcon } from '@heroicons/vue/24/outline'

  defineProps<{
    close: () => void
  }>()
</script>

<template>
  <Newsletter />

  <!-- Actions -->
  <div class="mt-5 sm:mt-6">
    <button
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset ring-base-0/20"
      type="button"
      @click="close()"
    >
      Dismiss
    </button>
  </div>
</template>
