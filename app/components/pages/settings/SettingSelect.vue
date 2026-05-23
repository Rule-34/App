<script lang="ts" setup>
  import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/20/solid'
  import { useFloating, offset, flip, shift } from '@floating-ui/vue'

  defineOptions({
    inheritAttrs: false
  })

  defineProps<{
    modelValue: string
    options: string[]
  }>()
  const emit = defineEmits<{
    'update:modelValue': [value: string]
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
    class="flex flex-row items-center justify-between gap-4"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <span class="flex grow flex-col">
      <HeadlessListboxLabel
        as="span"
        class="leading-8 font-medium text-base-content-highlight"
      >
        <slot name="name" />
      </HeadlessListboxLabel>

      <span class="text-sm text-base-content">
        <slot name="description" />
      </span>
    </span>

    <HeadlessListboxButton
      ref="referenceEl"
      class="inline-flex items-center rounded-lg px-2 py-1 text-base-content-highlight ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
    >
      {{ modelValue }}

      <ChevronDownIcon
        aria-hidden="true"
        class="-mr-0.5 h-5 w-5 text-base-content"
      />
    </HeadlessListboxButton>

    <Teleport to="body">
      <Transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <HeadlessListboxOptions
          ref="floatingEl"
          :style="floatingStyles"
          class="z-50 w-36 divide-y divide-base-0/20 overflow-hidden rounded-md bg-base-1000 ring-1 ring-base-0/20 ring-inset focus:outline-hidden"
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
                <div class="flex justify-between">
                  <p :class="selected ? 'font-medium' : 'font-normal'">{{ option }}</p>

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
          </HeadlessListboxOption>
        </HeadlessListboxOptions>
      </Transition>
    </Teleport>
  </HeadlessListbox>
</template>
