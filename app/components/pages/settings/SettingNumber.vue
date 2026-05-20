<script setup lang="ts">
  defineOptions({
    inheritAttrs: false
  })

  const id = useId()

  defineProps<{
    modelValue: number
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: number]
  }>()

  function onInput(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) {
      return
    }

    const nextValue = event.target.valueAsNumber

    if (Number.isFinite(nextValue)) {
      emit('update:modelValue', nextValue)
    }
  }
</script>

<template>
  <div class="flex flex-row items-center justify-between gap-2">
    <label
      class="flex grow flex-col"
      :for="id"
    >
      <span class="leading-8 font-medium text-base-content-highlight">
        <slot name="name" />
      </span>

      <span class="text-sm text-base-content">
        <slot name="description" />
      </span>
    </label>

    <input
      :id="id"
      :value="modelValue"
      class="h-6 w-12 rounded-full border-none bg-inherit px-2 text-center text-base-content-highlight ring-1 ring-base-0/20 hover:hover-bg-util focus-visible:focus-outline-util"
      min="0"
      type="number"
      v-bind="$attrs"
      @input="onInput"
    />
  </div>
</template>
