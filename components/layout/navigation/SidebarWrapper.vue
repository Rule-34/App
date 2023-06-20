<script setup>
  import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
  import { XMarkIcon } from '@heroicons/vue/24/outline'

  const { value: isMenuActive, toggle: toggleMenu } = useMenu()
</script>

<template>
  <div>
    <TransitionRoot
      :show="isMenuActive"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-40"
        @close="toggleMenu(false)"
      >
        <!-- Background -->
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-base-1000/80 backdrop-blur" />
        </TransitionChild>

        <div class="fixed inset-0 flex">
          <TransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
              <!-- Close button -->
              <TransitionChild
                as="template"
                enter="ease-in-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in-out duration-300"
                leave-from="opacity-100"
                leave-to="opacity-0"
              >
                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button
                    class="focus-visible:focus-util hover:hover-bg-util -m-2.5 rounded-md p-2.5"
                    type="button"
                    @click="toggleMenu(false)"
                  >
                    <span class="sr-only">Close menu</span>

                    <XMarkIcon class="hover:hover-text-util h-6 w-6 text-base-content-highlight" />
                  </button>
                </div>
              </TransitionChild>

              <!-- Sidebar -->
              <div class="flex grow flex-col overflow-y-auto bg-base-1000 px-6 ring-1 ring-base-0/10">
                <slot v-if="isMenuActive" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
