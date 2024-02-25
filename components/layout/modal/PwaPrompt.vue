<script lang="ts" setup>
  import { HomeIcon } from '@heroicons/vue/24/outline'
  import { watchOnce } from '@vueuse/core'
  import { ArrowPathIcon } from '@heroicons/vue/24/solid'

  const open = defineModel<boolean>()

  watchOnce(open, () => {
    if (!open.value) {
      const { promptInstallPwa } = useAppStatistics()

      promptInstallPwa.value = true
    }
  })

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
        class="text-base font-semibold leading-6 text-base-content-highlight"
      >
        Install the App?
      </HeadlessDialogTitle>

      <div class="mt-2">
        <p class="text-sm">
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
      loading="eager"
      src="https://www.installpwa.com/from/r34.app/embed?theme=dark"
      title="Install PWA iframe"
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
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-base-0/20"
      type="button"
      @click="open = false"
    >
      Dismiss
    </button>
  </div>
</template>
