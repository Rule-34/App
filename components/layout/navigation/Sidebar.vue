<script setup>
  import {
    ArrowDownTrayIcon,
    BuildingLibraryIcon,
    Cog6ToothIcon,
    HomeIcon,
    PhotoIcon,
    QuestionMarkCircleIcon,
    SparklesIcon,
    UserGroupIcon
  } from '@heroicons/vue/24/outline'

  const { value: isMenuActive, toggle: toggleMenu } = useMenu()

  const navigation = [
    {
      name: 'Home',
      icon: HomeIcon,

      href: '/',
      isExternal: false
    },
    {
      name: 'Posts',
      icon: PhotoIcon,

      // TODO: Make this dynamic
      href: '/posts/rule34.xxx',
      isExternal: false
    },
    {
      name: 'Friends',
      icon: UserGroupIcon,

      href: '/friends',
      isExternal: false
    },
    {
      name: 'FAQ',
      icon: QuestionMarkCircleIcon,

      href: 'https://docs.r34.app/frequently-asked-questions',
      isExternal: true
    },
    {
      name: 'Legal',
      icon: BuildingLibraryIcon,

      href: '/legal',
      isExternal: false
    },
    {
      name: 'Install App',
      icon: ArrowDownTrayIcon,

      href: 'https://www.installpwa.com/from/r34.app',
      isExternal: true
    },
    {
      name: 'Settings',
      icon: Cog6ToothIcon,

      href: '/settings',
      isExternal: false
    }
  ]
</script>

<template>
  <!-- Logo -->
  <div class="my-6 flex shrink-0 flex-col items-center justify-center gap-2">
    <NuxtImg
      alt="Logo"
      class="h-24 w-full opacity-95"
      height="16"
      loading="eager"
      src="/icon.svg"
      width="16"
    />

    <span class="text-2xl font-bold text-base-content-highlight">Rule 34 App</span>
  </div>

  <!-- Content -->
  <nav class="flex flex-1 flex-col">
    <ul
      class="flex flex-1 flex-col gap-y-3"
      role="list"
    >
      <li
        v-for="item in navigation"
        :key="item.name"
        class="-mx-2 space-y-1"
      >
        <NuxtLink
          :href="item.href"
          :target="item.isExternal ? '_blank' : undefined"
          class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
          exactActiveClass="bg-base-0/20 text-base-content-highlight"
        >
          <component
            :is="item.icon"
            class="h-6 w-6 shrink-0"
          />
          {{ item.name }}
        </NuxtLink>
      </li>

      <!-- Premium -->
      <li class="-mx-2 space-y-1">
        <NuxtLink
          class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 underline decoration-primary-500 decoration-2 underline-offset-8"
          exactActiveClass="bg-base-0/20 text-base-content-highlight"
          href="/premium"
        >
          <SparklesIcon class="h-6 w-6 shrink-0 text-primary-500" />
          Premium
        </NuxtLink>
      </li>

      <!-- Bottom -->
      <li class="flex flex-1 flex-col">
        <!-- Dummy element to take space -->
        <div class="flex-1"></div>

        <div class="flex justify-around pb-3">
          <!-- Twitter -->
          <NuxtLink
            class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util group flex flex-col items-center gap-2 rounded-md p-2 text-sm font-semibold"
            href="https://redirect.r34.app/twitter"
            target="_blank"
          >
            <svg
              class="icon mr-1 h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M24 4.56c-.88.39-1.83.65-2.83.77a4.93 4.93 0 0 0 2.17-2.72c-.95.56-2 .97-3.13 1.2a4.92 4.92 0 0 0-8.4 4.48C7.74 8.1 4.1 6.13 1.68 3.15A4.93 4.93 0 0 0 3.2 9.72a4.9 4.9 0 0 1-2.23-.61A4.93 4.93 0 0 0 4.91 14c-.69.18-1.45.23-2.22.08a4.93 4.93 0 0 0 4.6 3.42A9.9 9.9 0 0 1 0 19.54a13.94 13.94 0 0 0 7.55 2.21c9.14 0 14.3-7.72 14-14.64.95-.7 1.79-1.57 2.45-2.55z"
              />
            </svg>

            <span>Twitter</span>
          </NuxtLink>

          <!-- Discord -->
          <NuxtLink
            class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util group flex flex-col items-center gap-2 rounded-md p-2 text-sm font-semibold"
            href="https://redirect.r34.app/discord"
            target="_blank"
          >
            <svg
              class="icon mr-1 h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19.952 5.672c-1.904-1.531-4.916-1.79-5.044-1.801-.201-.017-.392.097-.474.281-.006.012-.072.163-.145.398 1.259.212 2.806.64 4.206 1.509.224.139.293.434.154.659-.09.146-.247.226-.407.226-.086 0-.173-.023-.252-.072C15.584 5.38 12.578 5.305 12 5.305s-3.585.075-5.989 1.567c-.225.14-.519.07-.659-.154-.14-.225-.07-.519.154-.659 1.4-.868 2.946-1.297 4.206-1.509-.074-.236-.14-.386-.145-.398-.083-.184-.273-.3-.475-.28-.127.01-3.139.269-5.069 1.822C3.015 6.625 1 12.073 1 16.783c0 .083.022.165.063.237 1.391 2.443 5.185 3.083 6.05 3.111h.015c.153 0 .297-.073.387-.197l.875-1.202c-2.359-.61-3.564-1.645-3.634-1.706-.198-.175-.217-.477-.042-.675.175-.198.476-.217.674-.043.029.026 2.248 1.909 6.612 1.909 4.372 0 6.591-1.891 6.613-1.91.198-.172.5-.154.674.045.174.198.155.499-.042.673-.07.062-1.275 1.096-3.634 1.706l.875 1.202c.09.124.234.197.387.197h.015c.865-.027 4.659-.667 6.05-3.111.04-.072.062-.153.062-.236 0-4.71-2.015-10.158-3.048-11.111zM8.891 14.87c-.924 0-1.674-.857-1.674-1.913s.749-1.913 1.674-1.913 1.674.857 1.674 1.913-.749 1.913-1.674 1.913zm6.218 0c-.924 0-1.674-.857-1.674-1.913s.749-1.913 1.674-1.913c.924 0 1.674.857 1.674 1.913s-.75 1.913-1.674 1.913z"
              />
            </svg>

            <span>Discord</span>
          </NuxtLink>
        </div>
      </li>
    </ul>
  </nav>
</template>
