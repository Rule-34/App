import * as TAILWIND_CONFIG from './tailwind.config'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  generate: { fallback: true },

  server: {
    host: '0.0.0.0'
  },

  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,

    API_URL: process.env.API_URL,

    PROXY_URL: process.env.PROXY_URL,

    MATOMO_HOST: process.env.MATOMO_HOST,
    MATOMO_SITE_ID: process.env.MATOMO_SITE_ID
  },

  head: {
    title: null,

    titleTemplate: (titleChunk) => {
      return titleChunk
        ? `${titleChunk} | Rule 34 App`
        : 'Rule 34 App – Popular Hentai Porn'
    },

    htmlAttrs: {
      lang: 'en'
    },

    meta: [
      { charset: 'utf-8' },
      { 'http-equiv': 'Cache-Control', content: 'no-cache' },
      { 'http-equiv': 'Pragma', content: 'no-cache' },
      { 'http-equiv': 'Expires', content: '0' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'Browse popular Rule 34 Hentai Porn for free. Without ads.' +
          ' We have Anime, Pokemon, Fortnite, Naruto, FNF, FNAF, CountryHumans, Brawl Stars, Gay, Video…'
      },
      {
        name: 'monetization',
        content: process.env.MONETIZATION_URI
      }
    ],

    link: [
      // Font
      {
        rel: 'stylesheet',
        type: 'text/css',
        href: 'https://rsms.me/inter/inter.css'
      }
    ],

    noscript: [{ innerHTML: 'This website requires JavaScript' }]
  },

  loading: {
    color: TAILWIND_CONFIG.theme.extend.colors.primary[400],
    failedColor: TAILWIND_CONFIG.theme.extend.colors.red[400],

    // height: '5px',

    throttle: 200,
    continuous: true
  },

  loadingIndicator: {
    name: 'cube-grid',
    color: TAILWIND_CONFIG.theme.extend.colors.darkGray[700],
    background: `linear-gradient(152deg, ${TAILWIND_CONFIG.theme.extend.colors.primary[400]} 38%, ${TAILWIND_CONFIG.theme.extend.colors.accent[400]} 90%)`
  },

  css: ['@/assets/css/main.css'],

  components: [{ path: '~/components', pathPrefix: false }],

  plugins: [
    { src: '~/plugins/a.pwa-update.js', mode: 'client' },
    { src: '~/plugins/c.vuex-persist.js', mode: 'client' },
    { src: '~/plugins/e.vuex-router-sync.js', mode: 'client' },
    { src: '~/plugins/g.migrate-state.js', mode: 'client' },
    { src: '~/plugins/z.vue-matomo.js', mode: 'client' }
  ],

  buildModules: ['@nuxt/postcss8'],

  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    'portal-vue/nuxt',
    '@nuxtjs/toast',
    '@nuxtjs/sentry',
    '@nuxtjs/sitemap'
  ],

  axios: {
    progress: true,

    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/'
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

          global: false
        },

        refreshToken: {
          property: 'refresh_token',
          required: true,
          maxAge: 60 * 60 * 24 * 15 // 15 days
        },

        user: {
          property: false,
          autoFetch: true
        },

        endpoints: {
          login: { url: `${process.env.API_URL}/auth/log-in`, method: 'post' },
          refresh: {
            url: `${process.env.API_URL}/auth/refresh`,
            method: 'post'
          },
          logout: false,
          user: { url: `${process.env.API_URL}/auth/profile`, method: 'get' }
        }
      }
    },

    watchLoggedIn: true,

    redirect: {
      login: '/premium',
      logout: '/premium',
      callback: false,
      home: false
    },

    vuex: { namespace: 'authentication' }
  },

  pwa: {
    // Icon is automatically proccessed from static/icon.png

    meta: {
      ogHost: `https://${process.env.APP_DOMAIN}`,
      mobileAppIOS: true
    },

    manifest: {
      name: 'Rule 34 App',
      short_name: 'Rule 34 App',
      description: 'Browse popular Rule 34 Hentai Porn for free. Without ads.',
      lang: 'en',
      start_url: '/?utm_source=PWA',
      theme_color: TAILWIND_CONFIG.theme.extend.colors.darkGray[700],
      background_color: TAILWIND_CONFIG.theme.extend.colors.darkGray[700],
      shortcuts: [
        {
          name: 'Settings',
          short_name: 'Settings',
          description: 'Settings to tweak your experience.',
          url: '/settings?utm_source=PWA&utm_medium=Shortcut'
        },
        {
          name: 'Saved Posts',
          short_name: 'Saved Posts',
          description: 'Save posts for later.',
          url: '/premium/saved-posts?utm_source=PWA&utm_medium=Shortcut'
        }
      ],
      useWebmanifestExtension: true
    },

    workbox: {
      runtimeCaching: [
        {
          urlPattern: ['https://rsms.me/.*']
        }
      ]
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

        // Matomo
        'ao.sync',

        // Axios
        'timeout of 0ms exceeded',

        // Browser
        'ReportingObserver [deprecation]: Deprecation messages are stored',
        'ReportingObserver [deprecation]: Element.createShadowRoot is deprecated',
        'ReportingObserver [deprecation]: Synchronous XMLHttpRequest on the main thread',
        'ReportingObserver [deprecation]: Custom cursors with size greater than 32x32 DIP intersecting native UI is deprecated',
        'ReportingObserver [intervention]: Modified page load behavior on the page because the page was expected to take a long amount of time to load',
        "ReportingObserver [deprecation]: 'Event.path' is deprecated and will be removed in M109",
        "ReportingObserver [deprecation]: 'window.webkitStorageInfo' is deprecated.",
        'ReportingObserver [deprecation]: chrome.loadTimes() is deprecated',

        // Browser extensions
        'instantSearchSDKJSBridgeClearHighlight',
        'window.bannerNight',

        // - Misc -
        'native code',
        'extension',
        'unknown module',
        'NotAllowedError',
        'Background Sync is disabled',
        'ResizeObserver loop limit exceeded'
      ],

      // Dokku automatic env variable
      release: process.env.GIT_REV
    }
  },

  sitemap: {
    hostname: `https://${process.env.APP_DOMAIN}`,

    defaults: {
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date()
    },

    // Static HTML files
    routes: [
      // Main
      { url: '/', priority: 1.0 },

      // Misc
      { url: '/privacy-policy', priority: 0.2 },
      { url: '/terms-of-service', priority: 0.2 }
    ]
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
      }
    },

    theme: 'toasted-custom-theme',

    closeOnSwipe: true
  },

  build: {
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {}
      }
    }
  },

  telemetry: false
}
