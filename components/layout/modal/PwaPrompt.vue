<script lang="ts" setup>
  import { HomeIcon } from '@heroicons/vue/24/outline'
  import { ArrowPathIcon } from '@heroicons/vue/24/solid'
  import { project } from '@/config/project'

  defineProps<{
    close: () => void
  }>()

  const isIframeLoaded = ref(false)
</script>

<template>
  <!-- Header -->
  <div>
    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
      <HomeIcon
        aria-hidden="true"
        class="h-6 w-6 text-blue-100"
      />
    </div>

    <div class="mt-3 text-center sm:mt-5">
      <HeadlessDialogTitle
        as="h3"
        class="text-base-content-highlight text-base leading-6 font-semibold"
      >
        Install the App?
      </HeadlessDialogTitle>

      <div class="mt-2">
        <p class="text-sm text-pretty">
          Add it to your home screen for quick and easy access,
          <!--          -->
          it doesnt need any permissions,
          <!--          -->
          <!--          is automatically updated,-->
          <!--          -->
          and it doesn't take any storage!
        </p>
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
      :src="`https://www.installpwa.com/from/${project.urls.production.hostname}/embed?theme=dark`"
      title="Install PWA"
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
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset"
      type="button"
      @click="close()"
    >
      Dismiss
    </button>
  </div>
</template>
