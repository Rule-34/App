<script lang="ts">
  export default {
    inheritAttrs: false
  }
</script>

<script lang="ts" setup>
  import { CheckIcon, ChevronDownIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
  import { useFloating, offset, flip, shift } from '@floating-ui/vue'

  const props = defineProps(['modelValue', 'options'])
  const emit = defineEmits(['update:modelValue'])

  const referenceEl = ref<HTMLElement>()
  const floatingEl = ref<HTMLElement>()

  const { floatingStyles } = useFloating(referenceEl, floatingEl, {
    placement: 'bottom-end',
    middleware: [offset(8), flip(), shift()]
  })
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

    <HeadlessListboxButton
      ref="referenceEl"
      class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util text-base-content-highlight ring-base-0/20 inline-flex items-center rounded-lg px-2 py-1 capitalize ring-1"
    >
      {{ modelValue }}

      <ChevronDownIcon
        aria-hidden="true"
        class="text-base-content -mr-0.5 h-5 w-5"
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
          class="divide-base-0/20 bg-base-1000 ring-base-0/20 z-50 w-36 divide-y overflow-hidden rounded-md ring-1 ring-inset focus:outline-hidden"
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
