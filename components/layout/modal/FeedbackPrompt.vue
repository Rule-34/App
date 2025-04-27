<script lang="ts" setup>
  import { LightBulbIcon } from '@heroicons/vue/24/outline'

  defineProps<{
    close: () => void
  }>()
</script>

<template>
  <!-- Header -->
  <div>
    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
      <LightBulbIcon
        aria-hidden="true"
        class="h-6 w-6 text-blue-100"
      />
    </div>

    <div class="mt-3 text-center sm:mt-5">
      <HeadlessDialogTitle
        as="h3"
        class="text-base-content-highlight text-base leading-6 font-semibold"
      >
        Got a minute?
      </HeadlessDialogTitle>

      <div class="mt-2">
        <p class="text-nice text-pretty">
          Vote on new features, report bugs, and share your ideas to make R34.app even better
        </p>
      </div>
    </div>
  </div>

  <!-- Body -->
  <div class="mt-5 sm:mt-6">
    <NuxtLink
      class="focus-visible:focus-outline-util relative block overflow-hidden rounded-lg"
      target="_blank"
      to="https://feedback.r34.app"
    >
      <img
        alt="Feedback website preview"
        class="h-auto max-h-[50svh] w-full object-cover"
        height="1080"
        src="https://screenshot.akbal.dev/v1/capture?width=720&height=1080&url=https://feedback.r34.app/"
        width="720"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </NuxtLink>
  </div>

  <!-- Actions -->
  <div class="mt-5 space-y-3 sm:mt-6">
    <NuxtLink
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset"
      target="_blank"
      to="https://feedback.r34.app"
    >
      Go to Feedback page
    </NuxtLink>

    <button
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset"
      type="button"
      @click="close()"
    >
      Dismiss
    </button>
  </div>
</template>
