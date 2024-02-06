<script lang="ts" setup>
  import { ChevronUpDownIcon } from '@heroicons/vue/20/solid'

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
    :class="[props.compact ? 'flex w-auto items-stretch !rounded-full !p-2.5' : 'w-56']"
    class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util relative cursor-default rounded-md bg-transparent py-1.5 pl-3 pr-10 text-left ring-1 ring-inset ring-base-0/20 sm:text-sm sm:leading-6"
    v-bind="$attrs"
  >
    <span class="flex items-center">
      <img
        :src="`https://icons.duckduckgo.com/ip2/r34.app.ico`"
        alt="Favicon"
        class="h-5 w-5 flex-shrink-0 rounded"
        height="128"
        loading="eager"
        width="128"
      />

      <span class="sr-only"> Website to browse: </span>

      <span
        v-if="!props.compact"
        class="ml-3 block truncate"
      >
        r34.app
      </span>
    </span>

    <!-- Chevron -->
    <span
      v-if="!props.compact"
      class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2"
    >
      <ChevronUpDownIcon class="h-5 w-5" />
    </span>
  </div>
</template>
