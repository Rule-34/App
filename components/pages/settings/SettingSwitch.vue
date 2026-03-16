<script>
  export default {
    inheritAttrs: false
  }
</script>

<script setup>
  const props = defineProps(['modelValue', 'disabled'])
  const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <HeadlessSwitchGroup
    as="div"
    class="flex flex-row items-center justify-between gap-4"
  >
    <span class="flex grow flex-col">
      <HeadlessSwitchLabel
        as="span"
        class="text-base-content-highlight leading-8 font-medium"
        passive
      >
        <slot name="name" />
      </HeadlessSwitchLabel>

      <HeadlessSwitchDescription
        as="span"
        class="text-base-content text-sm"
      >
        <slot name="description" />
      </HeadlessSwitchDescription>
    </span>

    <HeadlessSwitch
      :disabled="disabled"
      :modelValue="modelValue"
      class="focus-visible:focus-outline-util ring-base-0/20 ui-checked:bg-primary-700 ui-not-checked:bg-base-1000 relative inline-flex h-6 w-12 shrink-0 rounded-full border-2 border-transparent ring-1 transition-colors duration-200 ease-in-out"
      :class="disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
      @update:modelValue="emit('update:modelValue', $event)"
    >
      <span
        aria-hidden="true"
        class="bg-base-content-highlight ui-checked:translate-x-6 ui-not-checked:translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out"
      />
    </HeadlessSwitch>
  </HeadlessSwitchGroup>
</template>
