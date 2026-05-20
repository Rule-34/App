<script lang="ts" setup>
  import { XMarkIcon } from '@heroicons/vue/24/outline'

  defineProps<{
    isOpen: boolean
  }>()

  const emit = defineEmits<{
    close: []
  }>()
</script>

<template>
  <HeadlessTransitionRoot
    :show="isOpen"
    as="template"
  >
    <HeadlessDialog
      as="div"
      class="relative z-10"
      @close="emit('close')"
    >
      <!-- Overlay -->
      <HeadlessTransitionChild
        as="template"
        enter="ease-in-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in-out duration-300"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-base-1000/80 backdrop-blur-sm transition-opacity" />
      </HeadlessTransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <HeadlessTransitionChild
              as="template"
              enter="transform transition ease-in-out duration-300"
              enter-from="translate-x-full"
              enter-to="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leave-from="translate-x-0"
              leave-to="translate-x-full"
            >
              <HeadlessDialogPanel class="pointer-events-auto relative w-screen max-w-md">
                <!-- Close Button -->
                <HeadlessTransitionChild
                  as="template"
                  enter="ease-in-out duration-300"
                  enter-from="opacity-0"
                  enter-to="opacity-100"
                  leave="ease-in-out duration-300"
                  leave-from="opacity-100"
                  leave-to="opacity-0"
                >
                  <div class="absolute top-0 left-0 -ml-9 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
                    <button
                      :aria-label="$t('common.closeDialog')"
                      class="relative rounded-md p-1 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                      type="button"
                      @click="emit('close')"
                    >
                      <span class="absolute -inset-2.5" />

                      <XMarkIcon
                        aria-hidden="true"
                        class="h-6 w-6"
                      />
                    </button>
                  </div>
                </HeadlessTransitionChild>

                <!-- Sidebar -->
                <div class="flex h-full flex-col bg-base-1000 shadow-xl ring-1 ring-base-0/10">
                  <!-- Header -->
                  <div
                    v-if="$slots.title || $slots.description"
                    class="h-0 flex-1 overflow-y-auto"
                  >
                    <div class="px-4 py-6 sm:px-6">
                      <!-- Title -->
                      <HeadlessDialogTitle class="text-xl leading-8 font-semibold text-base-content-highlight">
                        <slot name="title" />
                      </HeadlessDialogTitle>

                      <!-- Description -->
                      <div
                        v-if="$slots.description"
                        class="mt-1"
                      >
                        <p class="text-sm">
                          <slot name="description" />
                        </p>
                      </div>
                    </div>

                    <!-- Content -->
                    <div class="flex flex-1 flex-col justify-between">
                      <slot />
                    </div>
                  </div>

                  <!-- Footer -->
                  <!-- Actions -->
                  <div class="flex shrink-0 justify-end gap-4 px-4 py-4">
                    <slot name="actions" />
                  </div>
                </div>
              </HeadlessDialogPanel>
            </HeadlessTransitionChild>
          </div>
        </div>
      </div>
    </HeadlessDialog>
  </HeadlessTransitionRoot>
</template>
