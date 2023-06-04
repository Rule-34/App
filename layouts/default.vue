<script setup>

const appStatistics = useAppStatistics()

  const userSettings = useUserSettings()

  const { value: isMenuActive, toggle: toggleMenu } = useMenu()
  const { value: isSearchMenuActive, toggle: toggleSearchMenu } = useSearchMenu()

  const router = useRouter()

  // Close menus on route change
  router.afterEach(() => {
    toggleMenu(false)
    toggleSearchMenu(false)
  })

  function touchHandler(direction, event) {
    if (!userSettings.navigationTouchGestures) {
      console.debug('Gestures setting is disabled, skipping...')
      return
    }

    const touchThreshold = screen.availWidth * 0.25
    console.debug(touchThreshold, event)

    switch (direction) {
      case 'right':
        if (event.touchstartX > touchThreshold) {
          console.debug('Insufficient touch threshold')
          return
        }

        if (isSearchMenuActive.value) {
          toggleSearchMenu(false)

          //
        } else {
          toggleMenu(true)
        }
        break

      case 'left':
        if (event.touchstartX < screen.availWidth - touchThreshold) {
          console.debug('Insufficient touch threshold')
          return
        }

        if (!isSearchMenuActive.value) {
          toggleSearchMenu(true)

          //
        } else {
          toggleMenu(false)
        }
        break
    }
  }

  // TODO: Log general errors to the user with a Toast

  console.info(
    '%cWe ❤︎ open source!',
    'font-size:32px;font-weight:bold;letter-spacing:0.02em;color:hsl(205, 78%, 62%);background-color:white;padding:8px 16px;'
  )
  console.info(
    '%cContribute: https://redirect.r34.app/github\nJoin our discord: https://redirect.r34.app/discord',
    'background-color:hsl(0, 0%, 7%);padding:4px 8px;font-size:16px;color:white;'
  )
</script>

<template>
  <!-- TODO: Restore gestures -->
  <!--    v-touch="{-->
  <!--      left: (e) => touchHandler('left', e),-->
  <!--      right: (e) => touchHandler('right', e)-->
  <!--    }"-->
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

    <Toaster
      close-button
      position="top-center"
      theme="dark"
    />

    <SidebarWrapper>
      <LazySidebar />
    </SidebarWrapper>

    <Navbar />

    <!-- Layout content -->
    <!-- Use `flex-1` to take all remaining space -->
    <slot />
  </div>
</template>
