<script lang="ts" setup>
  defineProps<{
    close: () => void
  }>()
</script>

<template>
  <!-- Header -->
  <div>
    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
      <FaceSmileIcon
        aria-hidden="true"
        class="h-6 w-6 text-green-50"
      />
    </div>

    <div class="mt-3 text-center sm:mt-5">
      <HeadlessDialogTitle
        as="h3"
        class="text-base-content-highlight text-base leading-6 font-semibold"
      >
        Are you enjoying R34.app?
      </HeadlessDialogTitle>

      <div class="mt-2">
        <p class="text-sm text-pretty">Let me know with a rating and a few words about your experience</p>
      </div>
    </div>
  </div>

  <!-- Body -->
  <div class="mt-10 pb-10">
    <NuxtLink
      class="focus-visible:focus-outline-util text-base-content-highlight mx-auto flex w-full max-w-fit justify-center border border-[#00b67a] px-4 py-2 text-center"
      href="https://www.trustpilot.com/evaluate/r34.app"
      rel="nofollow noopener"
      target="_blank"
    >
      Review us on &nbsp;

      <img
        alt="Trustpilot logo"
        class="mr-0.5 h-6 w-6"
        src="https://icons.duckduckgo.com/ip2/trustpilot.com.ico"
      />

      Trustpilot
    </NuxtLink>
  </div>

  <!-- Actions -->
  <div class="mt-5 sm:mt-6">
    <button
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset"
      type="button"
      @click="close()"
    >
      Dismiss
    </button>
  </div>
</template>
