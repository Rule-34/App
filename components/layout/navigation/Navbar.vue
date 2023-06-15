<script setup>
  import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
  import { StarIcon } from '@heroicons/vue/24/solid'

  const { value: isMenuActive, toggle: toggleMenu } = useMenu()
</script>

<template>
  <nav class="bg-gray-1000 border-b border-b-base-0/20">
    <!-- -->

    <!-- Container -->
    <div class="mx-auto max-w-3xl sm:px-6 lg:px-8">
      <!-- -->

      <!-- Navbar -->
      <div class="relative flex h-14 items-center justify-between">
        <!-- -->

        <!-- Right side: Menu button -->
        <div class="absolute inset-y-0 left-0 flex items-center pl-2">
          <button
            class="hover:hover-text-util focus-visible:focus-util hover:hover-bg-util inline-flex items-center justify-center rounded-md p-2 text-base-content-highlight focus-visible:ring-inset"
            type="button"
            @click="toggleMenu()"
          >
            <span class="sr-only">Open main menu</span>

            <Bars3Icon
              v-if="!isMenuActive"
              class="block h-6 w-6"
            />

            <XMarkIcon
              v-else
              class="block h-6 w-6"
            />
          </button>
        </div>

        <!-- Center: Logo -->
        <div class="flex flex-1 items-center justify-center">
          <div class="group flex-shrink-0">
            <StarIcon class="flip-vertical-fwd h-6 w-6 text-base-content-highlight" />
          </div>
        </div>

        <!-- Right side: Actions -->
        <TeleportTarget
          id="navbar-actions"
          class="absolute inset-y-0 right-0 flex flex-row-reverse items-center pr-2"
        >
        </TeleportTarget>
      </div>
    </div>
  </nav>
</template>
