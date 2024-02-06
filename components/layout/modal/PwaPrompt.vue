<script lang="ts" setup>
  import { HomeIcon } from '@heroicons/vue/24/outline'
  import { watchOnce } from '@vueuse/core'

  const open = defineModel<boolean>()

  watchOnce(open, () => {
    if (!open.value) {
      const { promptInstallPwa } = useAppStatistics()

      promptInstallPwa.value = true
    }
  })
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
          <!-- TODO: Mention times visited? -->
          Add it to your home screen for quick and easy access,
          <!--          -->
          it doesn't take any storage!
        </p>
      </div>
    </div>
  </div>

  <!-- Body -->
  <iframe
    border="0"
    cellspacing="0"
    class="mt-5 h-screen max-h-[60vh] w-full rounded-md sm:mt-6"
    loading="eager"
    onload="this.style.visibility='visible';"
    src="https://www.installpwa.com/from/r34.app/embed?theme=dark"
    style="visibility: hidden"
  />

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
