<script lang="ts" setup>
  import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'
  import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/20/solid'
  import { Float } from '@headlessui-float/vue'

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
  <Listbox
    :modelValue="modelValue"
    as="div"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <ListboxLabel class="sr-only">Change sort options</ListboxLabel>

    <div class="relative">
      <Float
        :offset="8"
        leave="transition ease-in duration-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
        placement="bottom-end"
        portal
        tailwindcss-origin-class
      >
        <!-- Button -->
        <div class="inline-flex divide-x divide-base-0/20 rounded-md shadow-sm ring-1 ring-base-0/20">
          <!-- Left side -->
          <div class="inline-flex items-center gap-x-1.5 rounded-l-md px-2 py-1 text-base-content shadow-sm">
            <component
              :is="icon"
              aria-hidden="true"
              class="-ml-0.5 h-5 w-5"
            />
            <p class="whitespace-nowrap text-sm font-medium">{{ modelValue.title }}</p>
          </div>

          <!-- Right side -->
          <ListboxButton
            ref="trigger"
            class="focus-visible:focus-util hover:hover-text-util hover:hover-bg-util inline-flex items-center rounded-l-none rounded-r-md px-2 py-1"
          >
            <span class="sr-only">Change published status</span>
            <ChevronDownIcon
              aria-hidden="true"
              class="-ml-0.5 h-5 w-5"
            />
          </ListboxButton>
        </div>

        <ListboxOptions
          class="w-44 divide-y divide-base-0/20 overflow-hidden rounded-md bg-base-1000 shadow-lg ring-1 ring-inset ring-base-0/20 focus:outline-none"
        >
          <ListboxOption
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
                    <CheckIcon
                      aria-hidden="true"
                      class="h-5 w-5"
                    />
                  </span>
                </div>
              </div>
            </div>
          </ListboxOption>
        </ListboxOptions>
      </Float>
    </div>
  </Listbox>
</template>
