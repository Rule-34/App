<script>
  export default {
    inheritAttrs: false
  }
</script>

<script setup>
  import { CheckIcon, ChevronDownIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

  const props = defineProps(['modelValue', 'options'])
  const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <HeadlessListbox
    :modelValue="modelValue"
    as="div"
    class="flex flex-row items-center justify-between gap-4"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <span class="flex flex-grow flex-col">
      <HeadlessListboxLabel
        as="span"
        class="font-medium leading-8 text-base-content-highlight"
      >
        <slot name="name" />
      </HeadlessListboxLabel>

      <span class="text-sm text-base-content">
        <slot name="description" />
      </span>
    </span>

    <Float
      :offset="8"
      leave="transition ease-in duration-100"
      leave-from="opacity-100"
      leave-to="opacity-0"
      placement="bottom-end"
      strategy="fixed"
      tailwindcss-origin-class
      vue-transition
    >
      <HeadlessListboxButton
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util inline-flex items-center rounded-lg px-2 py-1 capitalize text-base-content-highlight ring-1 ring-base-0/20"
      >
        {{ modelValue }}

        <ChevronDownIcon class="-mr-0.5 h-5 w-5 text-base-content" />
      </HeadlessListboxButton>

      <HeadlessListboxOptions
        class="w-36 divide-y divide-base-0/20 overflow-hidden rounded-md bg-base-1000 ring-1 ring-inset ring-base-0/20 focus:outline-none"
      >
        <HeadlessListboxOption
          v-for="option in options"
          :key="option"
          v-slot="{ active, selected }"
          :value="option"
        >
          <div
            :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
            class="cursor-default select-none px-4 py-2.5 text-sm"
          >
            <div class="flex flex-col">
              <div class="flex justify-between capitalize">
                <p :class="selected ? 'font-medium' : 'font-normal'">{{ option }}</p>

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
    </Float>
  </HeadlessListbox>
</template>
