<script setup lang="ts">
  defineOptions({
    inheritAttrs: false
  })

  defineProps<{
    modelValue: boolean
  }>()
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()
</script>

<template>
  <HeadlessSwitchGroup
    as="div"
    class="flex flex-row items-center justify-between gap-4"
  >
    <span class="flex grow flex-col">
      <HeadlessSwitchLabel
        as="span"
        class="leading-8 font-medium text-base-content-highlight"
        passive
      >
        <slot name="name" />
      </HeadlessSwitchLabel>

      <HeadlessSwitchDescription
        as="span"
        class="text-sm text-base-content"
      >
        <slot name="description" />
      </HeadlessSwitchDescription>
    </span>

    <HeadlessSwitch
      :model-value="modelValue"
      class="relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent ring-1 ring-base-0/20 transition-colors duration-200 ease-in-out focus-visible:focus-outline-util ui-checked:bg-primary-700 ui-not-checked:bg-base-1000"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <span
        aria-hidden="true"
        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-base-content-highlight shadow-sm ring-0 transition duration-200 ease-in-out ui-checked:translate-x-6 ui-not-checked:translate-x-0"
      />
    </HeadlessSwitch>
  </HeadlessSwitchGroup>
</template>
