<script>
  export default {
    inheritAttrs: false
  }
</script>

<script setup>
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
    <span class="flex grow flex-col">
      <HeadlessListboxLabel
        as="span"
        class="text-base-content-highlight leading-8 font-medium"
      >
        <slot name="name" />
      </HeadlessListboxLabel>

      <span class="text-base-content text-sm">
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
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util text-base-content-highlight ring-base-0/20 inline-flex items-center rounded-lg px-2 py-1 capitalize ring-1"
      >
        {{ modelValue }}

        <ChevronDownIcon class="text-base-content -mr-0.5 h-5 w-5" />
      </HeadlessListboxButton>

      <HeadlessListboxOptions
        class="divide-base-0/20 bg-base-1000 ring-base-0/20 w-36 divide-y overflow-hidden rounded-md ring-1 ring-inset focus:outline-hidden"
      >
        <HeadlessListboxOption
          v-for="option in options"
          :key="option"
          v-slot="{ active, selected }"
          :value="option"
        >
          <div
            :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
            class="cursor-default px-4 py-2.5 text-sm select-none"
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
