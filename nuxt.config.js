import * as TAILWIND_CONFIG from './tailwind.config'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  generate: { fallback: true },

  server: {
    host: '0.0.0.0',
  },

  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,

    API_URL: process.env.API_URL,

    PROXY_URL: process.env.PROXY_URL,

    MATOMO_HOST: process.env.MATOMO_HOST,
    MATOMO_SITE_ID: process.env.MATOMO_SITE_ID,
  },

  head: {
    title: null,

    titleTemplate: (titleChunk) => {
      return titleChunk
        ? `${titleChunk} | Rule 34 App`
        : 'Rule 34 App – Popular Hentai Porn'
    },

    htmlAttrs: {
      lang: 'en',
    },

    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'Browse popular Rule 34 Hentai Porn for free. Without ads.' +
          ' We have Anime, Pokemon, Fortnite, Naruto, FNF, FNAF, CountryHumans, Brawl Stars, Gay, Video…',
      },
      {
        name: 'monetization',
        content: process.env.MONETIZATION_URI,
      },
    ],

    link: [
      // Font
      {
        rel: 'stylesheet',
        type: 'text/css',
        href: 'https://rsms.me/inter/inter.css',
      },
    ],

    noscript: [{ innerHTML: 'This website requires JavaScript' }],
  },

  loading: {
    color: TAILWIND_CONFIG.theme.extend.colors.primary[400],
    failedColor: TAILWIND_CONFIG.theme.extend.colors.red[400],

    // height: '5px',

    throttle: 200,
    continuous: true,
  },

  loadingIndicator: {
    name: 'cube-grid',
    color: TAILWIND_CONFIG.theme.extend.colors.darkGray[700],
    background: `linear-gradient(152deg, ${TAILWIND_CONFIG.theme.extend.colors.primary[400]} 38%, ${TAILWIND_CONFIG.theme.extend.colors.accent[400]} 90%)`,
  },

  css: ['~/assets/css/main.css'],

  components: [{ path: '~/components', pathPrefix: false }],

  plugins: [
    { src: '~/plugins/pwa-update.js', mode: 'client' },
    { src: '~/plugins/vuex-persist.js', mode: 'client' },
    { src: '~/plugins/migrate-state.js', mode: 'client' },
    { src: '~/plugins/vuex-router-sync.js', mode: 'client' },
    { src: '~/plugins/vue-matomo.js', mode: 'client' },
  ],

  buildModules: [
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
    //
    '@nuxtjs/localforage',
  ],

  tailwindcss: {
    viewer: false,

    cssPath: '~/assets/css/main.css',
  },

  localforage: {
    name: 'Rule34App',
    storeName: 'localForage',
  },

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    'portal-vue/nuxt',
    '@nuxtjs/pwa',
    '@nuxtjs/sentry',
    '@nuxtjs/sitemap',
    '@nuxtjs/toast',
  ],

  axios: {
    progress: true,

    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },

  auth: {
    strategies: {
      local: {
        scheme: 'refresh',

        token: {
          type: 'Bearer',
          property: 'access_token',
          // 30 minutes
          maxAge: 1800,
          required: true,

          global: false,
        },

        refreshToken: {
          property: 'refresh_token',
          required: true,
          maxAge: 60 * 60 * 24 * 15, // 15 days
        },

        user: {
          property: false,
          autoFetch: true,
        },

        endpoints: {
          login: { url: `${process.env.API_URL}/auth/log-in`, method: 'post' },
          refresh: {
            url: `${process.env.API_URL}/auth/refresh`,
            method: 'post',
          },
          logout: false,
          user: { url: `${process.env.API_URL}/auth/profile`, method: 'get' },
        },
      },
    },

    watchLoggedIn: true,

    redirect: {
      login: '/premium',
      logout: '/premium',
      callback: false,
      home: false,
    },

    vuex: { namespace: 'authentication' },
  },

  pwa: {
    manifest: {
      name: 'Rule 34 App',
      short_name: 'Rule 34 App',
      lang: 'en',
      start_url: '/?utm_source=PWA',
      theme_color: TAILWIND_CONFIG.theme.extend.colors.darkGray[700],
      background_color: TAILWIND_CONFIG.theme.extend.colors.darkGray[700],
      shortcuts: [
        {
          name: 'Settings',
          short_name: 'Settings',
          description: 'Settings to tweak your experience.',
          url: '/settings?utm_source=PWA&utm_medium=Shortcut',
        },
        {
          name: 'Saved Posts',
          short_name: 'Saved Posts',
          description: 'Save posts for later.',
          url: '/premium/saved-posts?utm_source=PWA&utm_medium=Shortcut',
        },
      ],
    },
    meta: {
      ogHost: `https://${process.env.APP_DOMAIN}`,
      mobileAppIOS: true,
    },
    // Icon is automatically proccessed from static/icon.png
  },

  workbox: {
    runtimeCaching: [
      {
        urlPattern: ['https://rsms.me/.*'],
      },
    ],
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,

    lazy: true,

    disabled: process.env.SENTRY_DISABLED || false,
    disableClientSide: false,
    disableServerSide: true,

    // Publish options are set in `.sentryclirc` or as ENV variables
    publishRelease: true,
    sourceMapStyle: 'source-map',

    config: {
      sampleRate: process.env.SENTRY_SAMPLE_RATE || 1,

      allowUrls: [process.env.APP_DOMAIN],

      ignoreErrors: [
        // - Network -
        'Request failed with status code',
        'Network Error',

        // - Media -
        'AbortError',
        'Request aborted',
        'webkitExitFullScreen',
        'Picture-in-Picture',

        // - Plugins -
        'matomo',
        'vue-matomo',

        // - Misc -
        'native code',
        'extension',
        'unknown module',
        'NotAllowedError',
        'Background Sync is disabled',
        'ResizeObserver loop limit exceeded',

        // Browser extensions
        'instantSearchSDKJSBridgeClearHighlight',
        'window.bannerNight',

        // Matomo
        'ao.sync',

        // localForage
        'Database',
        'indexedDB',
        'window.webkitStorageInfo',
        'QuotaExceededError',
        'Transaction timed out due to inactivity',

        // Axios
        'timeout of 0ms exceeded',
      ],

      // Dokku automatic env variable
      release: process.env.GIT_REV,
    },
  },

  sitemap: {
    hostname: `https://${process.env.APP_DOMAIN}`,

    defaults: {
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date(),
    },

    // Static HTML files
    routes: [
      // Main
      { url: '/', priority: 1.0 },

      // Misc
      { url: '/privacy-policy', priority: 0.2 },
      { url: '/terms-of-service', priority: 0.2 },
    ],
  },

  toast: {
    position: 'top-right',

    duration: 5000,

    keepOnHover: true,

    action: {
      text: 'Close',

      class: 'toasted-custom-action',

      onClick: (e, toastObject) => {
        toastObject.goAway(0)
      },
    },

    theme: 'toasted-custom-theme',

    closeOnSwipe: true,
  },

  build: {
    extractCSS: true,
  },

  telemetry: false,
}
