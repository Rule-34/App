<script lang="ts" setup>
  import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
  import { ArrowPathIcon } from '@heroicons/vue/24/solid'

  defineProps<{
    close: () => void
  }>()

  const isIframeLoaded = ref(false)
</script>

<template>
  <!-- Header -->
  <div>
    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
      <QuestionMarkCircleIcon
        aria-hidden="true"
        class="h-6 w-6 text-blue-100"
      />
    </div>

    <div class="mt-3 text-center sm:mt-5">
      <HeadlessDialogTitle
        as="h3"
        class="text-base font-semibold leading-6 text-base-content-highlight"
      >
        Got a minute?
      </HeadlessDialogTitle>

      <div class="mt-2">
        <p class="text-sm">Let me know what you think about R34.app and how I can improve it</p>
      </div>
    </div>
  </div>

  <!-- Body -->
  <div class="relative">
    <iframe
      :class="{ invisible: !isIframeLoaded }"
      border="0"
      class="mt-5 h-screen max-h-[60vh] w-full rounded-md sm:mt-6"
      credentialless
      loading="eager"
      src="https://docs.google.com/forms/d/e/1FAIpQLSeJLEq12Z2T8nqOh9hqMAnKGKo0G3Zy-J6eBKVIlZAwS5kfSg/viewform?embedded=true"
      title="Feedback form"
      @load="isIframeLoaded = true"
    />

    <template v-if="!isIframeLoaded">
      <div class="absolute inset-0 flex w-full animate-pulse flex-col items-center justify-center gap-4 text-lg">
        <ArrowPathIcon class="h-12 w-12 animate-spin" />

        <h3>Loading&hellip;</h3>
      </div>
    </template>
  </div>

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
