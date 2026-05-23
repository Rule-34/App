<script lang="ts" setup>
  import { ChevronUpDownIcon } from '@heroicons/vue/20/solid'
  import { project } from '~~/config/project'

  defineOptions({
    inheritAttrs: false
  })

  interface DomainSelectorProps {
    compact?: boolean
  }

  const props = defineProps<DomainSelectorProps>()

  const faviconUrl = useFaviconUrl(project.urls.production.hostname)
</script>

<template>
  <div
    :class="[props.compact ? 'flex w-auto items-stretch rounded-full! p-2.5!' : 'w-56']"
    class="relative cursor-default rounded-md bg-transparent py-1.5 pr-10 pl-3 text-left ring-1 ring-base-0/20 ring-inset hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util sm:text-sm sm:leading-6"
    v-bind="$attrs"
  >
    <span class="flex items-center">
      <img
        :alt="$t('common.favicon')"
        :src="faviconUrl"
        class="h-5 w-5 shrink-0 rounded-sm"
        height="20"
        width="20"
      />

      <span class="sr-only"> {{ $t('common.websiteToBrowse') }} </span>

      <span
        v-if="!props.compact"
        class="ml-3 block truncate"
      >
        {{ project.urls.production.hostname }}
      </span>
    </span>

    <!-- Chevron -->
    <span
      v-if="!props.compact"
      class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2"
    >
      <ChevronUpDownIcon
        aria-hidden="true"
        class="h-5 w-5"
      />
    </span>
  </div>
</template>
