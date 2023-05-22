<script setup>
  import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/vue/24/outline'
  import { StarIcon } from '@heroicons/vue/24/solid'

  const { value: isMenuActive, toggle: toggleMenu } = useMenu()
</script>

<template>
  <nav class="bg-gray-1000 border-b border-b-base-0/20">
    <!-- Background -->

    <div class="pointer-events-none relative isolate">
      <!-- TODO: Investigate and fix overflow, and switch back to absolute-->
      <div
        aria-hidden="true"
        class="fixed inset-x-0 -right-8 -top-12 -z-10 flex transform-gpu justify-center overflow-hidden blur-2xl md:-top-52 md:blur-3xl"
      >
        <div
          class="aspect-[1108/632] w-full flex-none bg-gradient-to-l from-primary-300 to-accent-700 opacity-25"
          style="
            clip-path: polygon(
              100% 0%,
              100% 82.2%,
              92.5% 84.9%,
              75.7% 64%,
              70.64% 73.45%,
              56.7% 36.26%,
              46.53% 47.55%,
              0% 0%
            );
          "
        />
      </div>
    </div>

    <!-- TODO: Select container in tailwindui -->
    <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div class="relative flex h-14 items-center justify-between">
        <!-- Menu button -->
        <div class="absolute inset-y-0 left-0 flex items-center">
          <button
            class="hover:hover-text-util focus-visible:focus-util hover:hover-bg-util inline-flex items-center justify-center rounded-md p-2 text-base-content-highlight focus-visible:ring-inset"
            type="button"
            @click="toggleMenu()"
          >
            <span class="sr-only">Open main menu</span>

            <Bars3Icon
              v-if="!isMenuActive"
              aria-hidden="true"
              class="block h-6 w-6"
            />

            <XMarkIcon
              v-else
              aria-hidden="true"
              class="block h-6 w-6"
            />
          </button>
        </div>

        <!-- Logo -->
        <div class="flex flex-1 items-center justify-center">
          <div class="group flex-shrink-0">
            <StarIcon class="flip-vertical-fwd h-6 w-6 text-base-content-highlight" />
          </div>
        </div>

        <!-- Actions -->
        <div
          id="navbar-actions"
          class="absolute inset-y-0 right-0 flex flex-row-reverse items-center pr-2"
        >
          <!-- Notifications -->
          <button
            class="focus-visible:focus-util hover:hover-bg-util rounded-lg px-2 py-1.5"
            type="button"
            @click="toggleNotificationsMenu()"
          >
            <span class="sr-only">View notifications</span>

            <BellIcon
              aria-hidden="true"
              class="hover:hover-text-util h-6 w-6 text-base-content-highlight"
            />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
