<script lang="ts" setup>
  import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/20/solid'
  import { useFloating, offset, flip, shift } from '@floating-ui/vue'
  import type { Component } from 'vue'

  type FilterValue = string | number | boolean | null | undefined
  type FilterOption = { label: string; value: FilterValue }

  defineProps<{
    modelValue: FilterOption
    label: string
    options: FilterOption[]
    icon: Component
  }>()
  const emit = defineEmits<{
    'update:modelValue': [value: FilterOption]
  }>()

  const referenceEl = ref<HTMLElement>()
  const floatingEl = ref<HTMLElement>()

  const { floatingStyles } = useFloating(referenceEl, floatingEl, {
    placement: 'bottom-end',
    middleware: [offset(8), flip(), shift()]
  })
</script>

<template>
  <HeadlessListbox
    :model-value="modelValue"
    as="div"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <HeadlessListboxLabel class="sr-only">{{ $t('search.changeOptions', { label }) }}</HeadlessListboxLabel>

    <!-- Button -->
    <div class="inline-flex divide-x divide-base-0/20 rounded-md ring-1 ring-base-0/20">
      <!-- Left side -->
      <div class="inline-flex items-center gap-x-1.5 rounded-l-md px-2 py-1 text-base-content">
        <component
          :is="icon"
          class="-ml-0.5 h-5 w-5"
        />

        <span class="text-sm font-medium whitespace-nowrap">{{ modelValue.label }}</span>
      </div>

      <!-- Right side -->
      <HeadlessListboxButton
        ref="referenceEl"
        class="inline-flex items-center rounded-l-none rounded-r-md px-2 py-1 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
      >
        <span class="sr-only">{{ $t('search.changeFilter', { label }) }}</span>

        <ChevronDownIcon class="-ml-0.5 h-5 w-5" />
      </HeadlessListboxButton>
    </div>

    <Teleport to="body">
      <Transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <HeadlessListboxOptions
          ref="floatingEl"
          :style="floatingStyles"
          class="z-50 w-44 divide-y divide-base-0/20 overflow-hidden rounded-md bg-base-1000 ring-1 ring-base-0/20 ring-inset focus:outline-hidden"
        >
          <HeadlessListboxOption
            v-for="option in options"
            :key="option.label"
            v-slot="{ active, selected }"
            :value="option"
          >
            <div
              :class="[active ? 'hover-bg-util text-base-content-highlight' : 'text-base-content']"
              class="cursor-default px-4 py-2.5 text-sm select-none"
            >
              <div class="flex flex-col">
                <div class="flex justify-between">
                  <p :class="selected ? 'font-medium' : 'font-normal'">{{ option.label }}</p>

                  <!-- Check icon -->
                  <span
                    v-if="selected"
                    :class="active ? 'text-base-content-highlight' : 'text-base-content'"
                  >
                    <CheckIcon class="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>
          </HeadlessListboxOption>
        </HeadlessListboxOptions>
      </Transition>
    </Teleport>
  </HeadlessListbox>
</template>
