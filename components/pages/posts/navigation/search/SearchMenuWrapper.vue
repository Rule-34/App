<script lang="ts" setup>
  import { XMarkIcon } from '@heroicons/vue/24/outline'

  const { value: isSearchMenuActive, toggle: toggleSearchMenu } = useSearchMenu()
</script>

<template>
  <!--  This component is only tasked with rendering the search menu in a Dialog -->
  <HeadlessTransitionRoot
    :show="isSearchMenuActive"
    as="template"
  >
    <HeadlessDialog
      as="div"
      class="relative z-10"
      @close="toggleSearchMenu"
    >
      <!-- Background -->
      <HeadlessTransitionChild
        as="template"
        enter="transition-opacity ease-linear duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="bg-base-1000/80 fixed inset-0 backdrop-blur-sm" />
      </HeadlessTransitionChild>

      <div class="fixed inset-0 flex flex-row-reverse">
        <HeadlessTransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0"
          leave-to="translate-x-full"
        >
          <HeadlessDialogPanel class="relative ml-16 flex w-full max-w-xs flex-1">
            <!-- Close button -->
            <HeadlessTransitionChild
              as="template"
              enter="ease-in-out duration-300"
              enter-from="opacity-0"
              enter-to="opacity-100"
              leave="ease-in-out duration-300"
              leave-from="opacity-100"
              leave-to="opacity-0"
            >
              <div class="absolute top-0 right-full flex w-16 justify-center pt-5">
                <button
                  aria-label="Close menu"
                  class="focus-visible:focus-outline-util hover:hover-bg-util -m-2.5 rounded-md p-2.5"
                  type="button"
                  @click="toggleSearchMenu(false)"
                >
                  <XMarkIcon aria-hidden="true" class="hover:hover-text-util text-base-content-highlight h-6 w-6" />
                </button>
              </div>
            </HeadlessTransitionChild>

            <!-- Sidebar -->
            <div class="bg-base-1000 ring-base-0/10 flex grow flex-col gap-y-6 overflow-y-auto px-6 pt-12 pb-6 ring-1">
              <!-- -->

              <slot />
            </div>
          </HeadlessDialogPanel>
        </HeadlessTransitionChild>
      </div>
    </HeadlessDialog>
  </HeadlessTransitionRoot>
</template>
