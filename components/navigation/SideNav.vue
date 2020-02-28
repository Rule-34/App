<template>
  <aside class="fixed min-h-screen w-full z-30 flex">
    <!-- Actual Navigation Bar -->
    <!-- Only show borders on medium screens -->
    <div
      class="material-container border-0 rounded-none md:border-r m-0 relative flex flex-col min-h-full color-util"
    >
      <!-- Hero Image -->
      <div class="w-full overflow-hidden relative">
        <picture>
          <source srcset="/img/icon.webp" type="image/webp" />
          <img
            loading="eager"
            class="sidebar-img w-full h-auto object-cover"
            src="/img/icon.png"
            alt="Rule 34 App Logo"
          />
        </picture>

        <!-- Text on image -->
        <div class="absolute bottom-0 left-0 p-3 transition--color">
          <h1 class="font-black">Rule 34 App</h1>
          <h3 class="font-normal">Enjoy all Rule 34 sites</h3>
        </div>
      </div>

      <!-- Separator -->
      <div class="w-full bg-border" style="height: 1px;"></div>

      <!-- Navbar Links -->
      <nav class="p-3 bg-background flex-1 flex flex-col justify-between">
        <ul class="text-center md:text-left leading-loose">
          <li>
            <nuxt-link class="nav-links" to="/">
              <span class="nav-spacer"></span>
              <span class="relative">Dashboard</span>
            </nuxt-link>
          </li>

          <li>
            <nuxt-link class="nav-links" to="/faq">
              <span class="nav-spacer"></span>
              <span class="relative">Faq</span>
            </nuxt-link>
          </li>

          <li>
            <nuxt-link class="nav-links" to="/usage">
              <span class="nav-spacer"></span>
              <span class="relative">Usage</span>
            </nuxt-link>
          </li>

          <li>
            <nuxt-link class="nav-links" to="/about">
              <span class="nav-spacer"></span>
              <span class="relative">About</span>
            </nuxt-link>
          </li>

          <li>
            <nuxt-link class="nav-links" to="/settings">
              <span class="nav-spacer"></span>
              <span class="relative">Settings</span>
            </nuxt-link>
          </li>
        </ul>

        <ul class="flex flex-row justify-around">
          <!-- Discord -->
          <li>
            <a class="nav-links--bottom flex" href="https://discord.gg/fUhYHSZ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="fill-current mr-1 w-6 h-6 icon"
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
            <nuxt-link class="nav-links--bottom flex" to="/legal">
              <span>Legal</span>
            </nuxt-link>
          </li>

          <!-- Patreon -->
          <li>
            <a
              class="nav-links--bottom flex"
              href="https://www.patreon.com/VoidlessSeven7"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="fill-current mr-1 w-6 h-6 icon"
              >
                <path
                  d="M3 3c-.552 0-1 .448-1 1v16c0 .552.448 1 1 1h2c.552 0 1-.448 1-1V4c0-.552-.448-1-1-1H3zm12 0c-3.859 0-7 3.141-7 7s3.141 7 7 7 7-3.141 7-7-3.141-7-7-7z"
                />
              </svg>

              <span>Patreon</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Space for clicking out of the menu -->
    <div class="sidebar-close-area bg-black-25" @click="sideNavManager" />
  </aside>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'SideNav',

  computed: {
    ...mapState(['searchData'])
  },
  methods: {
    ...mapMutations(['sideNavManager'])
  }
}
</script>

<style>
/* Sidebar */
.nav-links {
  transition: transform 0.35s, var(--transition--color);
  @apply relative block;
}

.nav-links--bottom {
  transition: transform 0.35s, var(--transition--color);
}

.nav-links:hover {
  transform: translateX(5px);
}

.nav-links--bottom:hover {
  transform: scale(1.1);
}

.nav-spacer {
  @apply absolute inset-0 opacity-0;
}

/* ----------------- Rest of styles ----------------- */
</style>
