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
        class="relative z-20"
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
            <HeadlessDialogPanel class="relative mx-auto flex max-h-[80vh] w-full max-w-2xl flex-1 self-end px-4">
              <!-- Sidebar -->
              <div class="flex grow flex-col overflow-y-auto rounded-t-md bg-base-1000 px-4 py-4 ring-1 ring-base-0/10">
                <slot />
              </div>
            </HeadlessDialogPanel>
          </HeadlessTransitionChild>
        </div>
      </HeadlessDialog>
    </HeadlessTransitionRoot>
  </div>
</template>
