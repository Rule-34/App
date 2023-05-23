<script setup>
  import { Touch } from 'vuetify/directives'

  const vTouch = Touch

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
    // console.debug(touchThreshold, event)

    switch (direction) {
      case 'right':
        if (event.touchstartX > touchThreshold) {
          console.debug('Insufficient touch threshold')
          return
        }

        if (isSearchMenuActive) {
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

        if (!isSearchMenuActive) {
          toggleSearchMenu(true)

          //
        } else {
          toggleMenu(false)
        }
        break
    }
  }

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
  <!--  TODO: Fix not working when z-10 is used -->
  <div
    v-touch="{
      left: (e) => touchHandler('left', e),
      right: (e) => touchHandler('right', e)
    }"
  >
    <Toaster
      close-button
      position="top-center"
      theme="dark"
    />

    <Sidebar />

    <Navbar />

    <!-- Layout content -->
    <!-- TODO: Create container component: https://tailwindui.com/components/application-ui/layout/containers -->
    <slot />
  </div>
</template>
