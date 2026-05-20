<script lang="ts" setup>
  import { HomeIcon } from '@heroicons/vue/24/outline'
  import { ArrowPathIcon } from '@heroicons/vue/24/solid'
  import { project } from '~~/config/project'

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
        class="text-base leading-6 font-semibold text-base-content-highlight"
      >
        {{ $t('modals.pwa.title') }}
      </HeadlessDialogTitle>

      <div class="mt-2">
        <p class="text-sm text-pretty">
          {{ $t('modals.pwa.description') }}
        </p>
      </div>
    </div>
  </div>

  <!-- Body -->
  <div class="relative">
    <iframe
      :class="{ invisible: !isIframeLoaded }"
      class="mt-5 h-screen max-h-[60vh] w-full rounded-md border-0 sm:mt-6"
      credentialless
      :src="`https://www.installpwa.com/from/${project.urls.production.hostname}/embed?theme=dark`"
      :title="$t('modals.pwa.iframeTitle')"
      @load="isIframeLoaded = true"
    />

    <template v-if="!isIframeLoaded">
      <div class="absolute inset-0 flex w-full animate-pulse flex-col items-center justify-center gap-4 text-lg">
        <ArrowPathIcon class="h-12 w-12 animate-spin" />

        <h3>{{ $t('modals.pwa.loading') }}</h3>
      </div>
    </template>
  </div>

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
