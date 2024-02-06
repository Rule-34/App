<script setup>
  import { toast, Toaster } from 'vue-sonner'

  useAppStatistics()

  const { toggle: toggleMenu } = useMenu()
  const { toggle: toggleSearchMenu } = useSearchMenu()

  const router = useRouter()

  // Close menus on route change
  router.afterEach(() => {
    toggleMenu(false)
    toggleSearchMenu(false)
  })

  // Show error toast on uncaught errors
  // TODO: Verify it works
  onErrorCaptured((error) => {
    toast.error(error.message)
  })

  console.info(
    '%cWe ❤︎ open source!',
    'font-size:32px;font-weight:bold;letter-spacing:0.02em;color:hsl(205, 78%, 62%);background-color:white;padding:8px 16px;'
  )
  console.info(
    '%cContribute: https://redirect.r34.app/github\nJoin our discord: https://redirect.r34.app/discord',
    'background-color:hsl(0, 0%, 7%);padding:4px 8px;font-size:16px;color:white;'
  )
</script>

<!-- TODO: Restore gestures -->
<template>
  <div class="relative flex h-full flex-col">
    <!-- Background -->
    <div
      aria-hidden="true"
      class="absolute inset-x-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-xl md:blur-3xl"
    >
      <div
        class="-mr-3 -mt-3 aspect-[1108/632] w-full flex-none bg-gradient-to-l from-primary-300 to-accent-700 opacity-25"
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

    <!-- TODO: Restore when needed -->
    <!--    <PwaUpdater />-->

    <ClientOnly>
      <Toaster
        :expand="true"
        close-button
        position="top-center"
        theme="dark"
      />

      <DialogManager />
    </ClientOnly>

    <SidebarWrapper>
      <LazySidebar />
    </SidebarWrapper>

    <Navbar />

    <!-- Layout content -->
    <!-- Use `flex-1` to take all remaining space -->
    <slot />
  </div>
</template>
