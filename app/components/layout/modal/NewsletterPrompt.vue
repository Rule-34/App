<script lang="ts" setup>
  defineProps<{
    close: () => void
  }>()
</script>

<template>
  <Newsletter />

  <!-- Actions -->
  <div class="mt-5 sm:mt-6">
    <button
      class="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-base-0/20 ring-inset hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
      type="button"
      @click="close()"
    >
      {{ $t('common.close') }}
    </button>
  </div>
</template>
