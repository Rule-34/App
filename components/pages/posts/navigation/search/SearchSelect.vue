<script lang="ts" setup>
  import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/20/solid'

  const props = defineProps({
    modelValue: {
      type: Object,
      required: true
    },

    options: {
      type: Array,
      required: true
    },

    icon: {
      required: true
    }
  })

  const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <HeadlessListbox
    :modelValue="modelValue"
    as="div"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <HeadlessListboxLabel class="sr-only">Change options</HeadlessListboxLabel>

    <Float
      :offset="8"
      leave="transition ease-in duration-100"
      leave-from="opacity-100"
      leave-to="opacity-0"
      placement="bottom-end"
      strategy="fixed"
      tailwindcss-origin-class
    >
      <!-- Button -->
      <div class="inline-flex divide-x divide-base-0/20 rounded-md ring-1 ring-base-0/20">
        <!-- Left side -->
        <div class="inline-flex items-center gap-x-1.5 rounded-l-md px-2 py-1 text-base-content">
          <component
            :is="icon"
            class="-ml-0.5 h-5 w-5"
          />

          <span class="whitespace-nowrap text-sm font-medium">{{ modelValue.title }}</span>
        </div>

        <!-- Right side -->
        <HeadlessListboxButton
          class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util inline-flex items-center rounded-l-none rounded-r-md px-2 py-1"
        >
          <span class="sr-only">Change published status</span>

          <ChevronDownIcon class="-ml-0.5 h-5 w-5" />
        </HeadlessListboxButton>
      </div>

      <HeadlessListboxOptions
        class="w-44 divide-y divide-base-0/20 overflow-hidden rounded-md bg-base-1000 ring-1 ring-inset ring-base-0/20 focus:outline-none"
      >
        <HeadlessListboxOption
          v-for="option in options"
          :key="option.title"
          v-slot="{ active, selected }"
          :value="option"
        >
          <div
            :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
            class="cursor-default select-none px-4 py-2.5 text-sm"
          >
            <div class="flex flex-col">
              <div class="flex justify-between">
                <p :class="selected ? 'font-medium' : 'font-normal'">{{ option.title }}</p>

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
