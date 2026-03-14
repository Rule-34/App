<script lang="ts" setup>
  import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
  import { vIntersectionObserver } from '@vueuse/components'

  const route = useRoute()

  const { value: isMenuActive, toggle: toggleMenu } = useMenu()

  const { seasonalEmoji } = useSeasonalIcon()

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

  const isOnTop = ref(true)
  const isNavbarVisible = ref(true)
  const lastScrollY = ref(0)

  const SCROLL_DELTA_THRESHOLD = 12
  const TOP_VISIBILITY_THRESHOLD = 8

  let scrollRafId: number | null = null

  function onIntersectionObserver(entries: IntersectionObserverEntry[], _observer: IntersectionObserver) {
    const entry = entries[0]

    if (!entry) {
      return
    }

    isOnTop.value = entry.isIntersecting
  }

  function onWindowScroll() {
    if (!isPostsPage.value || scrollRafId !== null) {
      return
    }

    scrollRafId = window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY

      if (currentScrollY <= TOP_VISIBILITY_THRESHOLD) {
        isNavbarVisible.value = true
        lastScrollY.value = currentScrollY
        scrollRafId = null

        return
      }

      const deltaY = currentScrollY - lastScrollY.value

      if (Math.abs(deltaY) >= SCROLL_DELTA_THRESHOLD) {
        isNavbarVisible.value = deltaY < 0
        lastScrollY.value = currentScrollY
      }

      scrollRafId = null
    })
  }

  watch(
    isPostsPage,
    (value) => {
      if (!import.meta.client) {
        return
      }

      if (!value) {
        isNavbarVisible.value = true
      }

      lastScrollY.value = window.scrollY
    },
    { immediate: true }
  )

  onMounted(() => {
    lastScrollY.value = window.scrollY
    window.addEventListener('scroll', onWindowScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onWindowScroll)

    if (scrollRafId !== null) {
      window.cancelAnimationFrame(scrollRafId)
      scrollRafId = null
    }
  })
</script>

<template>
  <!-- Same margin as Nav height -->
  <nav class="mb-14">
    <div v-intersection-observer="onIntersectionObserver" />

    <div
      :class="{
        'fixed!': isPostsPage,
        'bg-base-1000/60 shadow-lg backdrop-blur-lg backdrop-saturate-200 md:border-b-2': isPostsPage && !isOnTop,
        '-translate-y-full': isPostsPage && !isOnTop && !isNavbarVisible,
        'translate-y-0': !isPostsPage || isOnTop || isNavbarVisible
      }"
      class="border-base-0/20 absolute inset-x-0 top-0 z-10 transform-gpu transition-[transform,background-color,box-shadow,backdrop-filter] duration-200 will-change-transform"
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
            aria-label="Open main menu"
            class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util text-base-content-highlight inline-flex items-center justify-center rounded-md p-2 focus-visible:ring-inset"
            type="button"
            @click="toggleMenu()"
          >
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
            class="focus-visible:focus-outline-util shrink-0"
            to="/"
          >
            <img
              v-if="!seasonalEmoji"
              alt="Icon"
              class="flip-vertical-fwd text-base-content-highlight h-6 w-6"
              height="16"
              src="/icon.svg"
              width="16"
            />

            <!-- Seasonal Icon -->
            <span
              v-else
              class="flip-vertical-fwd flex h-6 w-6 items-center justify-center text-2xl"
              style="mask-image: url('/icon.svg'); mask-size: contain; mask-repeat: no-repeat; mask-position: center"
            >
              {{ seasonalEmoji }}
            </span>
          </NuxtLink>
        </div>

        <!-- Right side: Actions -->
        <div
          id="navbar-actions"
          class="absolute inset-y-0 right-0 flex flex-row-reverse items-center pr-2"
        />
      </div>
    </div>
  </nav>
</template>
