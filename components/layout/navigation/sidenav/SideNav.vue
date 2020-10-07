<template>
  <aside class="flex">
    <div
      class="flex flex-col border-0 rounded-none material-container sm:border-r color-util"
    >
      <div class="relative h-full overflow-hidden">
        <!-- Hero Image -->
        <picture>
          <source
            srcset="~/assets/img/brand/icon.webp"
            type="image/webp"
            height="512"
            width="512"
          />
          <img
            loading="eager"
            class="w-full h-auto sidebar-img--transition"
            src="~/assets/img/brand/icon.png"
            alt="Rule 34 App Logo"
            height="512"
            width="512"
          />
        </picture>

        <!-- Text on image -->
        <div
          class="absolute bottom-0 left-0 p-3 transition-colors duration-300"
        >
          <h1 class="text-lg font-semibold">Rule 34 App</h1>
          <h3>Browse the most popular boorus</h3>
        </div>
      </div>

      <!-- Navbar Links -->
      <nav class="flex flex-col h-full p-3 bg-background">
        <ul class="leading-loose text-center sm:text-left">
          <li v-for="link in sideNavLinks" :key="link.url">
            <nuxt-link class="nav-links" :to="link.url">
              <span class="absolute inset-0 opacity-0" />
              <span class="relative" v-text="link.title" />
            </nuxt-link>
          </li>

          <!-- Premium -->
          <li>
            <nuxt-link class="nav-links" to="/premium">
              <span class="absolute inset-0 opacity-0" />
              <span
                class="relative text-lg font-semibold text-gradient-background bg-gradient-blue-lilac"
              >
                Premium
              </span>
            </nuxt-link>
          </li>
        </ul>

        <!-- Separator -->
        <div class="flex-1">&nbsp;</div>

        <ul class="flex flex-row justify-around">
          <!-- Discord -->
          <li>
            <a
              class="flex nav-links--bottom"
              href="https://redirect.r34.app/discord"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="w-6 h-6 mr-1 fill-current icon"
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
            <nuxt-link class="flex nav-links--bottom" to="/legal">
              <span>Legal</span>
            </nuxt-link>
          </li>

          <!-- Donate -->
          <li>
            <a
              class="flex nav-links--bottom"
              href="https://redirect.r34.app/liberapay/"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="w-6 h-6 mr-1 fill-current icon"
              >
                <path
                  d="M3 3c-.552 0-1 .448-1 1v16c0 .552.448 1 1 1h2c.552 0 1-.448 1-1V4c0-.552-.448-1-1-1H3zm12 0c-3.859 0-7 3.141-7 7s3.141 7 7 7 7-3.141 7-7-3.141-7-7-7z"
                />
              </svg>

              <span>Donate</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Space for clicking out of the menu -->
    <div
      class="flex-1 hidden bg-transparent md:block"
      @click="setSideNavIsActive(false)"
    />
  </aside>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      sideNavLinks: [
        { title: 'Posts', url: '/' },
        { title: 'Faq', url: '/faq' },
        { title: 'Usage', url: '/usage' },
        { title: 'About', url: '/about' },
        { title: 'Settings', url: '/settings' },
      ],
    }
  },

  methods: {
    ...mapMutations('navigation', ['setSideNavIsActive']),
  },
}
</script>

<style lang="postcss">
/* ----- Sidebar related ----- */

.sidebar-img--transition {
  transition-timing-function: ease;
  @apply transition-transform delay-300 duration-500;
}

.sidebar-img--transition:hover {
  transform: scale(1.5);
}

/* Sidebar */
.nav-links {
  @apply relative block transition-transform duration-300;
}

.nav-links--bottom {
  @apply transition-transform duration-300;
}

.nav-links:hover {
  transform: translateX(5px);
}

.nav-links--bottom:hover {
  transform: scale(1.1);
}

.text-gradient-background {
  /* Apply your own background with gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
