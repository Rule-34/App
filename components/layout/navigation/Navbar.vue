<script setup>
  import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
  import { useScroll } from '@vueuse/core'

  const route = useRoute()

  const { value: isMenuActive, toggle: toggleMenu } = useMenu()

  const isPageWithLogoDisabled = computed(() => {
    switch (route.path) {
      case '/':
        return true

      default:
        return false
    }
  })
  const isPostsPage = computed(() =>
    [
      //
      '/posts/',
      '/premium/saved-posts/'
    ].some((path) => route.path.startsWith(path))
  )

  const showFixedNavbar = ref(true)
  const showNavbarBackground = ref(false)

  const { y, arrivedState, directions } = useScroll(
    process.client
      ? //
        window
      : undefined,
    {
      onScroll: () => {
        if (!isPostsPage.value) {
          showFixedNavbar.value = true
          showNavbarBackground.value = false
          return
        }

        if (
          //
          arrivedState.top === true ||
          //
          directions.top === true
        ) {
          showFixedNavbar.value = true

          //
        } else {
          showFixedNavbar.value = false
        }

        if (
          //
          arrivedState.top === false &&
          y.value >= 0
        ) {
          showNavbarBackground.value = true

          //
        } else {
          showNavbarBackground.value = false
        }
      }
    }
  )
</script>

<template>
  <!-- Same margin as Nav height -->
  <nav class="mb-14">
    <!-- TODO: refactor code -->
    <div
      :class="[
        isPostsPage
          ? //
            'fixed'
          : 'absolute',
        isPostsPage
          ? showNavbarBackground
            ? //
              'border-b-2 border-base-0/20 bg-base-1000/60 backdrop-blur'
            : '!border-0 border-transparent bg-transparent'
          : '',
        isPostsPage
          ? showFixedNavbar
            ? //
              'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0'
          : ''
      ]"
      class="inset-x-0 z-10 transition duration-200"
    >
      <!-- Navbar -->
      <div
        :class="[
          // Container
          'container mx-auto max-w-3xl sm:px-6 lg:px-8'
        ]"
        class="relative flex h-14 items-center justify-between"
      >
        <!-- -->

        <!-- Right side: Menu button -->
        <div class="absolute inset-y-0 left-0 flex items-center pl-2">
          <button
            class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center rounded-md p-2 text-base-content-highlight focus-visible:ring-inset"
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
          <NuxtLink
            v-if="!isPageWithLogoDisabled"
            class="focus-visible:focus-outline-util flex-shrink-0"
            to="/"
          >
            <img
              alt="Icon"
              class="flip-vertical-fwd h-6 w-6 text-base-content-highlight"
              height="16"
              loading="eager"
              src="/icon.svg"
              width="16"
            />
          </NuxtLink>
        </div>

        <!-- Right side: Actions -->
        <TeleportTarget
          id="navbar-actions"
          class="absolute inset-y-0 right-0 flex flex-row-reverse items-center pr-2"
        />
      </div>
    </div>
  </nav>
</template>
