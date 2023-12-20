<script lang="ts" setup>
  const props = defineProps({
    modelValue: Boolean
  })

  const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <HeadlessTransitionRoot
    :show="modelValue"
    as="template"
  >
    <HeadlessDialog
      as="div"
      class="relative z-40"
      @close="emit('update:modelValue', false)"
    >
      <HeadlessTransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-base-1000/60 backdrop-blur transition-opacity" />
      </HeadlessTransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <HeadlessTransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <HeadlessDialogPanel
              class="relative w-full transform overflow-hidden rounded-lg bg-base-1000 p-4 text-left ring-1 ring-base-0/20 transition-all sm:my-8 sm:max-w-sm sm:p-6"
            >
              <div class="max-h-[35rem] min-h-[35rem]">
                <slot v-if="modelValue" />
              </div>
            </HeadlessDialogPanel>
          </HeadlessTransitionChild>
        </div>
      </div>
    </HeadlessDialog>
  </HeadlessTransitionRoot>
</template>
