<script setup>
  import { useEventListener } from '@vueuse/core'
  import { sidebarNavigation } from 'assets/js/sidebarLinks'

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

  // Restore scroll position after fullscreen
  useEventListener('fullscreenchange', async (event) => {
    const isInFullscreen = document.fullscreenElement !== null

    if (isInFullscreen) {
      return
    }

    await nextTick()

    await new Promise((resolve) => setTimeout(resolve, 50))

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        event.target.scrollIntoView({
          block: 'center',
          inline: 'center'
        })
      })
    })
  })

  console.info(
    '%cWe ❤︎ open source!',
    'font-size:32px;font-weight:bold;letter-spacing:0.02em;color:hsl(205, 78%, 62%);background-color:white;padding:8px 16px;'
  )
  console.info(
    '%cContribute: https://github.com/Rule-34/App\nJoin our discord: https://discord.gg/fUhYHSZ',
    'background-color:hsl(0, 0%, 7%);padding:4px 8px;font-size:16px;color:white;'
  )
</script>

<!-- TODO: Restore gestures -->
<template>
  <div class="relative flex h-full flex-col">
    <!-- Background -->
    <div
      aria-hidden="true"
      class="absolute inset-x-0 -z-10 flex transform-gpu justify-center blur-xl md:blur-3xl"
    >
      <div
        class="aspect-1108/632 w-full flex-none bg-linear-to-l from-sky-300 to-violet-700 opacity-25"
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

    <ClientOnly>
      <!--      <DialogManager />-->
    </ClientOnly>

    <UDashboardGroup
      :persistent="false"
      storage="local"
    >
      <UDashboardSidebar
        :max-size="20"
        :ui="{
          root: 'divide-y-none',
          footer: 'justify-between'
        }"
      >
        <template #default="{ collapsed }">
          <UNavigationMenu
            :collapsed="collapsed"
            :items="sidebarNavigation"
            orientation="vertical"
          />
        </template>

        <template #footer="{ collapsed }">
          <UButton
            :ui="{
              leadingIcon: 'group-hover:text-[#5865F2]'
            }"
            aria-label="Discord"
            class="group flex-col text-sm"
            icon="fa6-brands:discord"
            target="_blank"
            to="https://discord.gg/fUhYHSZ"
            variant="ghost"
          >
            Discord
          </UButton>

          <UButton
            aria-label="GitHub"
            class="flex-col text-sm"
            icon="fa6-brands:github"
            target="_blank"
            to="https://github.com/Rule-34/App"
            variant="ghost"
          >
            GitHub
          </UButton>

          <UButton
            :ui="{
              leadingIcon: 'group-hover:text-[#1DA1F2]'
            }"
            aria-label="Twitter"
            class="group flex-col text-sm"
            icon="fa6-brands:twitter"
            target="_blank"
            to="https://twitter.com/Rule34App"
            variant="ghost"
          >
            Twitter
          </UButton>
        </template>
      </UDashboardSidebar>

      <UDashboardPanel id="navbar">
        <template #header>
          <UDashboardNavbar
            :toggle="{
              class: 'hover:bg-(--ui-primary)/10 focus-visible:bg-(--ui-primary)/10'
            }"
            :ui="{
              root: 'border-none'
            }"
          >
            <!-- -->

            <template #leading>
              <UButton
                class="gap-1 font-medium uppercase"
                to="/"
                variant="ghost"
              >
                R34.App
              </UButton>
            </template>

            <template #right>
              <UDashboardSearchButton
                :kbds="[]"
                class="hover:bg-(--ui-primary)/10 focus-visible:bg-(--ui-primary)/10"
                label="Search"
                variant="ghost"
              >
              </UDashboardSearchButton>
            </template>
          </UDashboardNavbar>
        </template>

        <template #body>
          <slot />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </div>
</template>
