<script lang="ts" setup>
  import { CloudArrowDownIcon } from '@heroicons/vue/24/solid'
</script>

<template>
  <ClientOnly>
    <div
      v-if="$pwa?.needRefresh"
      class="container mx-auto mb-4 max-w-3xl border-x border-b border-base-0/20 bg-transparent p-4"
      role="alert"
    >
      <div class="flex items-center">
        <CloudArrowDownIcon
          aria-hidden="true"
          class="me-2 h-6 w-6 shrink-0"
        />
        <span class="sr-only">{{ $t('common.info') }}</span>

        <h3 class="text-lg font-medium text-base-content-highlight">{{ $t('modals.pwaUpdater.title') }}</h3>
      </div>

      <div class="mt-2 mb-4 text-sm">{{ $t('modals.pwaUpdater.description') }}</div>

      <div class="flex">
        <button
          class="w-full items-center rounded-md border border-base-0/20 px-3 py-2 text-center text-sm font-medium text-base-content-highlight hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
          type="button"
          @click="$pwa.updateServiceWorker()"
        >
          {{ $t('common.refresh') }}
        </button>
      </div>
    </div>
  </ClientOnly>
</template>

<style>
  .pwa-toast {
    @apply fixed right-0 bottom-0 z-50 m-4 rounded-md border border-base-0/20 p-3 text-left;
  }

  .pwa-toast .message {
    @apply mb-2;
  }

  .pwa-toast button {
    @apply mr-2 rounded-md border border-base-0/20 px-3 py-1 outline-none;
  }
</style>
