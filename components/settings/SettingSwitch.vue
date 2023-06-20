<script>
  export default {
    inheritAttrs: false
  }
</script>

<script setup>
  import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from '@headlessui/vue'

  const props = defineProps(['modelValue'])
  const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <SwitchGroup
    as="div"
    class="flex flex-row items-center justify-between gap-2"
  >
    <span class="flex flex-grow flex-col">
      <SwitchLabel
        as="span"
        class="font-medium leading-8 text-base-content-highlight"
        passive
      >
        <slot name="name" />
      </SwitchLabel>

      <SwitchDescription
        as="span"
        class="text-sm text-base-content"
      >
        <slot name="description" />
      </SwitchDescription>
    </span>

    <Switch
      :modelValue="modelValue"
      class="focus-visible:focus-util relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent ring-1 ring-base-0/20 transition-colors duration-200 ease-in-out ui-checked:bg-primary-700 ui-not-checked:bg-base-1000"
      @update:modelValue="emit('update:modelValue', $event)"
    >
      <span
        aria-hidden="true"
        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-base-content-highlight shadow ring-0 transition duration-200 ease-in-out ui-checked:translate-x-6 ui-not-checked:translate-x-0"
      />
    </Switch>
  </SwitchGroup>
</template>
