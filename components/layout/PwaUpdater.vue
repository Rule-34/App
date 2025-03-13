<script lang="ts" setup></script>

<template>
  <ClientOnly>
    <div
      v-if="$pwa?.needRefresh"
      class="border-base-0/20 container mx-auto mb-4 max-w-3xl border-x border-b bg-transparent p-4"
      role="alert"
    >
      <div class="flex items-center">
        <CloudArrowDownIcon
          aria-hidden="true"
          class="me-2 h-6 w-6 shrink-0"
        />
        <span class="sr-only">Info</span>

        <h3 class="text-base-content-highlight text-lg font-medium">There is a new update</h3>
      </div>

      <div class="mt-2 mb-4 text-sm">Refresh or click the button below to apply the update</div>

      <div class="flex">
        <button
          class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util border-base-0/20 text-base-content-highlight w-full items-center rounded-md border px-3 py-2 text-center text-sm font-medium"
          type="button"
          @click="$pwa.updateServiceWorker()"
        >
          Refresh
        </button>
      </div>
    </div>
  </ClientOnly>
</template>

<style>
  .pwa-toast {
    @apply border-base-0/20 fixed right-0 bottom-0 z-50 m-4 rounded-md border p-3 text-left;
  }

  .pwa-toast .message {
    @apply mb-2;
  }

  .pwa-toast button {
    @apply border-base-0/20 mr-2 rounded-md border px-3 py-1 outline-none;
  }
</style>
