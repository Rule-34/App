<script setup>
  import { XMarkIcon } from '@heroicons/vue/24/outline'
  import { sidebarNavigation } from 'assets/js/sidebarLinks'

  const { value: isMenuActive, toggle: toggleMenu } = useMenu()
</script>

<template>
  <div>
    <HeadlessTransitionRoot
      :show="isMenuActive"
      as="template"
    >
      <HeadlessDialog
        as="div"
        class="relative z-10"
        @close="toggleMenu(false)"
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

        <div class="fixed inset-0 flex">
          <!-- Feedback -->
          <!-- TODO: Fix leave transition -->
          <HeadlessTransitionChild
            as="template"
            enter="transform transition ease-in-out duration-300"
            enter-from="translate-x-full"
            enter-to="translate-x-0"
            leave="transform transition ease-in-out duration-0"
            leave-from="translate-x-0"
            leave-to="translate-x-full"
          >
            <FeedbackButton />
          </HeadlessTransitionChild>

          <!-- Dialog -->
          <HeadlessTransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <HeadlessDialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
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
                <div class="absolute top-0 left-full flex w-16 justify-center pt-5">
                  <button
                    aria-label="Close menu"
                    class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util -m-2.5 rounded-md p-2.5"
                    type="button"
                    @click="toggleMenu(false)"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>
              </HeadlessTransitionChild>

              <!-- Sidebar -->
              <div class="bg-base-1000 ring-base-0/10 flex grow flex-col overflow-y-auto px-6 ring-1">
                <slot />
              </div>
            </HeadlessDialogPanel>
          </HeadlessTransitionChild>
        </div>
      </HeadlessDialog>
    </HeadlessTransitionRoot>

    <!-- Links for Search Engines -->
    <!-- TODO: Detect if its a Search Engine -->
    <div
      class="hidden"
      data-allow-mismatch
    >
      <template
        v-for="link in sidebarNavigation"
        :key="link.name"
      >
        <a
          :href="link.href"
          :rel="link.isExternal ? 'noopener noreferrer nofollow' : ''"
        >
          {{ link.name }}
        </a>
      </template>
    </div>
  </div>
</template>
