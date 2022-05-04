<template>
  <aside class="fixed z-40 flex w-full min-h-screen md:flex-row">
    <div class="flex flex-col md:border-r bg-darkGray-300 border-darkGray-100">
      <!-- Hero Image -->
      <div class="relative h-full overflow-hidden">
        <picture>
          <source
            height="512"
            srcset="~/assets/img/brand/icon.webp"
            type="image/webp"
            width="512"
          />

          <img
            alt="Rule 34 App Logo"
            class="transition-transform duration-500 delay-300 transform hover:scale-150"
            height="512"
            loading="eager"
            src="~/assets/img/brand/icon.png"
            width="512"
          />
        </picture>

        <!-- Text on image -->
        <div
          class="absolute bottom-0 left-0 p-3 transition-colors duration-300 link"
        >
          <h1 class="text-lg font-semibold">Rule 34 App</h1>
          <h3>Browse the most popular Boorus</h3>
        </div>
      </div>

      <nav class="flex flex-col h-full p-3 bg-darkGray-700">
        <!-- Navbar Links -->
        <ul class="flex-auto space-y-2 text-center sm:text-left">
          <li v-for="link in sideNavLinks" :key="link.title">
            <NuxtLink
              :to="link.url"
              class="relative block transition-transform duration-300 transform link hover:translate-x-1"
            >
              <span class="absolute inset-0 opacity-0" />
              <span class="relative"> {{ link.title }}</span>
            </NuxtLink>
          </li>

          <!-- Premium -->
          <li>
            <NuxtLink
              class="relative block transition-transform duration-300 transform link hover:translate-x-1"
              to="/premium"
            >
              <span class="absolute inset-0 opacity-0" />
              <span
                class="relative text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-primary-400"
              >
                Premium
              </span>
            </NuxtLink>
          </li>
        </ul>

        <ul class="flex flex-row justify-around">
          <!-- Discord -->
          <li>
            <a
              class="flex transition-transform duration-300 transform link hover:scale-110"
              href="https://redirect.r34.app/discord"
            >
              <svg
                class="w-6 h-6 mr-1 icon"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19.952 5.672c-1.904-1.531-4.916-1.79-5.044-1.801-.201-.017-.392.097-.474.281-.006.012-.072.163-.145.398 1.259.212 2.806.64 4.206 1.509.224.139.293.434.154.659-.09.146-.247.226-.407.226-.086 0-.173-.023-.252-.072C15.584 5.38 12.578 5.305 12 5.305s-3.585.075-5.989 1.567c-.225.14-.519.07-.659-.154-.14-.225-.07-.519.154-.659 1.4-.868 2.946-1.297 4.206-1.509-.074-.236-.14-.386-.145-.398-.083-.184-.273-.3-.475-.28-.127.01-3.139.269-5.069 1.822C3.015 6.625 1 12.073 1 16.783c0 .083.022.165.063.237 1.391 2.443 5.185 3.083 6.05 3.111h.015c.153 0 .297-.073.387-.197l.875-1.202c-2.359-.61-3.564-1.645-3.634-1.706-.198-.175-.217-.477-.042-.675.175-.198.476-.217.674-.043.029.026 2.248 1.909 6.612 1.909 4.372 0 6.591-1.891 6.613-1.91.198-.172.5-.154.674.045.174.198.155.499-.042.673-.07.062-1.275 1.096-3.634 1.706l.875 1.202c.09.124.234.197.387.197h.015c.865-.027 4.659-.667 6.05-3.111.04-.072.062-.153.062-.236 0-4.71-2.015-10.158-3.048-11.111zM8.891 14.87c-.924 0-1.674-.857-1.674-1.913s.749-1.913 1.674-1.913 1.674.857 1.674 1.913-.749 1.913-1.674 1.913zm6.218 0c-.924 0-1.674-.857-1.674-1.913s.749-1.913 1.674-1.913c.924 0 1.674.857 1.674 1.913s-.75 1.913-1.674 1.913z"
                />
              </svg>

              <span>Discord</span>
            </a>
          </li>

          <!-- Legal -->
          <li>
            <NuxtLink
              class="flex transition-transform duration-300 transform link hover:scale-110"
              to="/legal"
            >
              Legal
            </NuxtLink>
          </li>

          <!-- Donate -->
          <li>
            <a
              class="flex transition-transform duration-300 transform link hover:scale-110"
              href="https://redirect.r34.app/twitter"
            >
              <svg
                class="w-6 h-6 mr-1 icon"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M24 4.56c-.88.39-1.83.65-2.83.77a4.93 4.93 0 0 0 2.17-2.72c-.95.56-2 .97-3.13 1.2a4.92 4.92 0 0 0-8.4 4.48C7.74 8.1 4.1 6.13 1.68 3.15A4.93 4.93 0 0 0 3.2 9.72a4.9 4.9 0 0 1-2.23-.61A4.93 4.93 0 0 0 4.91 14c-.69.18-1.45.23-2.22.08a4.93 4.93 0 0 0 4.6 3.42A9.9 9.9 0 0 1 0 19.54a13.94 13.94 0 0 0 7.55 2.21c9.14 0 14.3-7.72 14-14.64.95-.7 1.79-1.57 2.45-2.55z" />
              </svg>

              <span>Twitter</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Space for clicking out of the menu -->
    <div
      class="flex-1 hidden bg-black bg-opacity-75 md:block"
      @click="sideNavNavigationManager({ operation: 'toggle' })"
    >
      &nbsp;
    </div>
  </aside>
</template>

<script>
import { mapActions } from 'vuex'
import { RouterHelper } from '~/assets/js/RouterHelper'

export default {
  data() {
    return {
      sideNavLinks: [
        {
          title: 'Posts',
          url: RouterHelper.generatePostsRouteWithDefaults(this.$nuxt.$store),
        },
        { title: 'Faq', url: '/faq' },
        { title: 'Partners', url: '/partners' },
        { title: 'Usage', url: '/usage' },
        { title: 'About', url: '/about' },
        { title: 'Settings', url: '/settings' },
      ],
    }
  },

  methods: {
    ...mapActions('navigation', ['sideNavNavigationManager']),
  },
}
</script>
