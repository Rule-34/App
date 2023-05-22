<script>
  export default {
    inheritAttrs: false
  }
</script>

<script setup>
  import { SwitchGroup, SwitchLabel } from '@headlessui/vue'

  const props = defineProps(['modelValue'])
  const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-row items-center justify-between gap-2">
    <!-- TODO: Generate random label ID -->
    <label class="flex flex-grow flex-col">
      <span class="font-medium leading-8 text-base-content-highlight">
        <slot name="name" />
      </span>

      <span class="text-sm text-base-content">
        <slot name="description" />
      </span>
    </label>

    <input
      :value="modelValue"
      class="focus-visible:focus-util h-6 w-12 rounded-full bg-inherit px-2 text-center text-base-content-highlight ring-2 ring-base-0/20"
      min="0"
      type="number"
      v-bind="$attrs"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
