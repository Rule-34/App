<script lang="ts" setup>
  import { PencilSquareIcon } from '@heroicons/vue/24/outline'
  import { project } from '~~/config/project'

  const { t } = useI18n()

  function handleClick() {
    window.open(`https://feedback.${project.urls.production.hostname}`, '_blank', 'noopener,noreferrer')
  }
</script>

<template>
  <div class="fixed right-[1dvw] bottom-1/2">
    <div class="flex flex-col items-center justify-center gap-2">
      <NuxtLink
        class="flex items-center justify-center gap-2 rounded-r-md bg-base-1000 p-2 ring-1 ring-base-0/15 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        rel="noopener noreferrer"
        style="writing-mode: vertical-lr; transform: rotate(180deg)"
        target="_blank"
        :to="`https://feedback.${project.urls.production.hostname}`"
        @click.prevent.stop="handleClick"
        @touchend.prevent.stop="handleClick"
      >
        <span class="text-base font-medium"> {{ t('common.feedback') }} </span>

        <PencilSquareIcon
          class="h-5 w-5"
          style="transform: rotate(180deg)"
        />
      </NuxtLink>
    </div>
  </div>
</template>
