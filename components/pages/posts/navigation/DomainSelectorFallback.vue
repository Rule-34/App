<script lang="ts" setup>
  import { ChevronUpDownIcon } from '@heroicons/vue/20/solid'
  import { project } from '@/config/project'

  defineOptions({
    inheritAttrs: false
  })

  interface DomainSelectorProps {
    compact?: boolean
  }

  const props = defineProps<DomainSelectorProps>()
</script>

<template>
  <div
    :class="[props.compact ? 'flex w-auto items-stretch rounded-full! p-2.5!' : 'w-56']"
    class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util ring-base-0/20 relative cursor-default rounded-md bg-transparent py-1.5 pr-10 pl-3 text-left ring-1 ring-inset sm:text-sm sm:leading-6"
    v-bind="$attrs"
  >
    <span class="flex items-center">
      <img
        :src="`https://icons.duckduckgo.com/ip2/${project.urls.production.hostname}.ico`"
        alt="Favicon"
        class="h-5 w-5 shrink-0 rounded-sm"
        height="128"
        width="128"
      />

      <span class="sr-only"> Website to browse: </span>

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
