<script setup lang="ts">
  import { XMarkIcon } from '@heroicons/vue/24/outline'
  import { sidebarLinks } from '~/assets/js/sidebarLinks'

  defineProps<{
    show: boolean
  }>()

  const { toggle: toggleMenu } = useMenu()
  const localePath = useLocalePath()
</script>

<template>
  <HeadlessTransitionRoot
    :show="show"
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
        <div class="fixed inset-0 bg-base-1000/80 backdrop-blur-sm" />
      </HeadlessTransitionChild>

      <div class="fixed inset-0 flex">
        <!-- Feedback -->
        <HeadlessTransitionChild
          as="template"
          enter="transform transition ease-in-out duration-300"
          enter-from="translate-x-full"
          enter-to="translate-x-0"
          leave="transform transition ease-in-out duration-300"
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
                  :aria-label="$t('common.closeMenu')"
                  class="-m-2.5 rounded-md p-2.5 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                  type="button"
                  @click="toggleMenu(false)"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>
            </HeadlessTransitionChild>

            <!-- Sidebar -->
            <div class="flex grow flex-col overflow-y-auto bg-base-1000 px-6 ring-1 ring-base-0/10">
              <slot />
            </div>
          </HeadlessDialogPanel>
        </HeadlessTransitionChild>
      </div>
    </HeadlessDialog>
  </HeadlessTransitionRoot>

  <!-- Links for Search Engines -->
  <div class="hidden">
    <template
      v-for="link in sidebarLinks"
      :key="link.nameKey"
    >
      <a
        :href="link.isExternal ? link.href : localePath(link.href)"
        :rel="link.isExternal ? 'noopener noreferrer nofollow' : undefined"
      >
        {{ $t(link.nameKey) }}
      </a>
    </template>
  </div>
</template>
