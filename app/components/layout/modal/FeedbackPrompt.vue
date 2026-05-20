<script lang="ts" setup>
  import { LightBulbIcon } from '@heroicons/vue/24/outline'
  import { project } from '~~/config/project'

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
        class="text-base leading-6 font-semibold text-base-content-highlight"
      >
        {{ $t('modals.feedback.title') }}
      </HeadlessDialogTitle>

      <div class="mt-2">
        <p class="text-nice text-pretty">
          {{ $t('modals.feedback.description', { name: project.shortName }) }}
        </p>
      </div>
    </div>
  </div>

  <!-- Body -->
  <div class="mt-5 sm:mt-6">
    <NuxtLink
      class="relative block overflow-hidden rounded-lg focus-visible:focus-outline-util"
      rel="noopener noreferrer"
      target="_blank"
      :to="`https://feedback.${project.urls.production.hostname}`"
    >
      <img
        :alt="$t('modals.feedback.previewAlt')"
        class="h-auto max-h-[50svh] w-full object-cover"
        height="1080"
        :src="`https://screenshot.akbal.dev/v1/capture?width=720&height=1080&url=https://feedback.${project.urls.production.hostname}/`"
        width="720"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </NuxtLink>
  </div>

  <!-- Actions -->
  <div class="mt-5 space-y-3 sm:mt-6">
    <NuxtLink
      class="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-base-0/20 ring-inset hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
      rel="noopener noreferrer"
      target="_blank"
      :to="`https://feedback.${project.urls.production.hostname}`"
    >
      {{ $t('modals.feedback.goToFeedbackPage') }}
    </NuxtLink>

    <button
      class="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-base-0/20 ring-inset hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
      type="button"
      @click="close()"
    >
      {{ $t('common.close') }}
    </button>
  </div>
</template>
