<script lang="ts" setup>
  import { sidebarLinks } from '~/assets/js/sidebarLinks'
  import { project } from '~~/config/project'

  const { t } = useI18n()
  const localePath = useLocalePath()

  // `settings` stays in the sidebar, it needs the current state of the app
  const footerLinks = sidebarLinks.filter((link) => link.id !== 'settings')

  const legalLinks = [
    { nameKey: 'pages.legal.privacyPolicy', href: '/privacy-policy' },
    { nameKey: 'pages.legal.termsOfService', href: '/terms-of-service' },
    { nameKey: 'pages.legal.cookiePolicy', href: '/cookie-policy' },
    { nameKey: 'pages.legal.dmca', href: '/dmca' }
  ]

  const currentYear = new Date().getFullYear()
</script>

<template>
  <div
    class="w-full border-t border-base-0/20 pt-8 pb-12"
    data-testid="home-footer"
  >
    <!-- Pages -->
    <nav>
      <ul
        class="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm sm:grid-cols-3 md:flex md:flex-wrap md:justify-center md:gap-x-6 md:gap-y-2"
      >
        <li
          v-for="link in footerLinks"
          :key="link.id"
        >
          <NuxtLink
            :href="link.isExternal ? link.href : localePath(link.href)"
            :rel="link.isExternal ? 'noopener noreferrer' : undefined"
            :target="link.isExternal ? '_blank' : undefined"
            class="inline-flex min-h-11 w-full items-center justify-center px-1 text-base-content hover:hover-text-util focus-visible:focus-outline-util sm:min-h-0 sm:w-auto sm:px-0"
          >
            {{ t(link.nameKey) }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Legal -->
    <nav class="mt-1.5 sm:mt-2">
      <ul
        class="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm sm:flex sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2"
      >
        <li
          v-for="link in legalLinks"
          :key="link.href"
        >
          <NuxtLink
            :href="localePath(link.href)"
            class="inline-flex min-h-11 w-full items-center justify-center px-1 text-base-content hover:hover-text-util focus-visible:focus-outline-util sm:min-h-0 sm:w-auto sm:px-0"
          >
            {{ t(link.nameKey) }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Social -->
    <nav class="mt-4 sm:mt-6">
      <ul class="flex flex-wrap justify-center gap-x-1 gap-y-0.5">
        <li>
          <NuxtLink
            :href="project.social.twitter"
            class="inline-flex min-h-11 items-center gap-x-2 rounded-md p-2 text-sm font-semibold text-base-content hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util sm:min-h-0"
            rel="nofollow noopener noreferrer"
            target="_blank"
          >
            <svg
              aria-hidden="true"
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M24 4.56c-.88.39-1.83.65-2.83.77a4.93 4.93 0 0 0 2.17-2.72c-.95.56-2 .97-3.13 1.2a4.92 4.92 0 0 0-8.4 4.48C7.74 8.1 4.1 6.13 1.68 3.15A4.93 4.93 0 0 0 3.2 9.72a4.9 4.9 0 0 1-2.23-.61A4.93 4.93 0 0 0 4.91 14c-.69.18-1.45.23-2.22.08a4.93 4.93 0 0 0 4.6 3.42A9.9 9.9 0 0 1 0 19.54a13.94 13.94 0 0 0 7.55 2.21c9.14 0 14.3-7.72 14-14.64.95-.7 1.79-1.57 2.45-2.55z"
              />
            </svg>

            <span>Twitter</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            :href="project.social.discord"
            class="flex items-center gap-x-2 rounded-md p-2 text-sm font-semibold text-base-content hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
            rel="nofollow noopener noreferrer"
            target="_blank"
          >
            <svg
              aria-hidden="true"
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19.952 5.672c-1.904-1.531-4.916-1.79-5.044-1.801-.201-.017-.392.097-.474.281-.006.012-.072.163-.145.398 1.259.212 2.806.64 4.206 1.509.224.139.293.434.154.659-.09.146-.247.226-.407.226-.086 0-.173-.023-.252-.072C15.584 5.38 12.578 5.305 12 5.305s-3.585.075-5.989 1.567c-.225.14-.519.07-.659-.154-.14-.225-.07-.519.154-.659 1.4-.868 2.946-1.297 4.206-1.509-.074-.236-.14-.386-.145-.398-.083-.184-.273-.3-.475-.28-.127.01-3.139.269-5.069 1.822C3.015 6.625 1 12.073 1 16.783c0 .083.022.165.063.237 1.391 2.443 5.185 3.083 6.05 3.111h.015c.153 0 .297-.073.387-.197l.875-1.202c-2.359-.61-3.564-1.645-3.634-1.706-.198-.175-.217-.477-.042-.675.175-.198.476-.217.674-.043.029.026 2.248 1.909 6.612 1.909 4.372 0 6.591-1.891 6.613-1.91.198-.172.5-.154.674.045.174.198.155.499-.042.673-.07.062-1.275 1.096-3.634 1.706l.875 1.202c.09.124.234.197.387.197h.015c.865-.027 4.659-.667 6.05-3.111.04-.072.062-.153.062-.236 0-4.71-2.015-10.158-3.048-11.111zM8.891 14.87c-.924 0-1.674-.857-1.674-1.913s.749-1.913 1.674-1.913 1.674.857 1.674 1.913-.749 1.913-1.674 1.913zm6.218 0c-.924 0-1.674-.857-1.674-1.913s.749-1.913 1.674-1.913c.924 0 1.674.857 1.674 1.913s-.75 1.913-1.674 1.913z"
              />
            </svg>

            <span>Discord</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            :href="project.social.github"
            class="flex items-center gap-x-2 rounded-md p-2 text-sm font-semibold text-base-content hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
            rel="nofollow noopener noreferrer"
            target="_blank"
          >
            <svg
              aria-hidden="true"
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>

            <span>GitHub</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <p class="mt-6 text-center text-xs text-base-content">© {{ currentYear }} {{ project.name }}</p>
  </div>
</template>
