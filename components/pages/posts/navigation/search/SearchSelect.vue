<script lang="ts" setup>
  const props = defineProps({
    modelValue: {
      type: Object,
      required: true
    },

    label: {
      type: String,
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
      vue-transition
    >
      <!-- Button -->
      <div class="divide-base-0/20 ring-base-0/20 inline-flex divide-x rounded-md ring-1">
        <!-- Left side -->
        <div class="text-base-content inline-flex items-center gap-x-1.5 rounded-l-md px-2 py-1">
          <component
            :is="icon"
            class="-ml-0.5 h-5 w-5"
          />

          <span class="text-sm font-medium whitespace-nowrap">{{ modelValue.label }}</span>
        </div>

        <!-- Right side -->
        <HeadlessListboxButton
          class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util inline-flex items-center rounded-l-none rounded-r-md px-2 py-1"
        >
          <span class="sr-only">Change {{ label }}</span>

          <ChevronDownIcon class="-ml-0.5 h-5 w-5" />
        </HeadlessListboxButton>
      </div>

      <HeadlessListboxOptions
        class="divide-base-0/20 bg-base-1000 ring-base-0/20 w-44 divide-y overflow-hidden rounded-md ring-1 ring-inset focus:outline-hidden"
      >
        <HeadlessListboxOption
          v-for="option in options"
          :key="option.label"
          v-slot="{ active, selected }"
          :value="option"
        >
          <div
            :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
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
    </Float>
  </HeadlessListbox>
</template>
