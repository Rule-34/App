<script setup lang="ts">
  const isOpen = defineModel<boolean>()
</script>

<template>
  <div>
    <HeadlessTransitionRoot
      :show="isOpen"
      as="template"
    >
      <HeadlessDialog
        as="div"
        class="relative z-10"
        @close="isOpen = false"
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
          <div class="fixed inset-0 bg-base-1000/80 backdrop-blur" />
        </HeadlessTransitionChild>

        <div class="fixed inset-0 flex">
          <!-- Dialog -->
          <HeadlessTransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="translate-y-full"
            enter-to="translate-y-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-y-0"
            leave-to="translate-y-full"
          >
            <HeadlessDialogPanel class="relative mx-auto flex max-h-[90vh] w-full max-w-2xl flex-1 self-end">
              <!-- Sidebar -->
              <div class="flex grow flex-col gap-2 rounded-t-xl bg-base-1000 ring-1 ring-base-0/20">
                <div class="grow overflow-y-auto">
                  <slot />
                </div>

                <!-- Dismiss -->
                <button
                  type="button"
                  @click="isOpen = false"
                  class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util mx-auto inline-flex w-full items-center justify-center border-t border-base-0/20 px-3 py-2 text-base"
                >
                  Dismiss
                </button>
              </div>
            </HeadlessDialogPanel>
          </HeadlessTransitionChild>
        </div>
      </HeadlessDialog>
    </HeadlessTransitionRoot>
  </div>
</template>
