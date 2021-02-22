export default {
  target: 'static',

  ssr: false,

  generate: { fallback: true },

  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,

    API_URL: process.env.API_URL,

    MATOMO_HOST: process.env.MATOMO_HOST,
    MATOMO_SITE_ID: process.env.MATOMO_SITE_ID,
  },

  head: {
    titleTemplate: (titleChunk) => {
      // If undefined or blank then we don't need the separator
      return titleChunk ? `${titleChunk} | Rule 34 App` : 'Rule 34 App'
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
        content: 'Browse the most popular boorus in the Rule 34 App',
      },
      {
        name: 'monetization',
        content: process.env.MONETIZATION_URI,
      },
    ],

    link: [
      // Font
      { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
      { rel: 'preconnect', href: 'https://rsms.me' },
      { rel: 'dns-prefetch ', href: 'https://rsms.me' },
    ],

    noscript: [{ innerHTML: 'This website requires JavaScript' }],
  },

  loading: {
    color: 'var(--color-gradient-two)',
    // height: '5px',
    throttle: 300,
    // duration: 5000,
    continuous: true,
  },

  loadingIndicator: {
    name: 'cube-grid',
    color: '#121212',
    background: 'linear-gradient(152deg, #9b9be0 38%, #00d4ff 100%)',
  },

  css: ['~/assets/css/main.css'],

  plugins: [
    { src: '~/plugins/vuex-router-sync.js', mode: 'client' },
    { src: '~/plugins/vuex-persist.js', mode: 'client' },
    { src: '~/plugins/vue-matomo.js', mode: 'client' },
  ],

  buildModules: [
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
  ],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  modules: ['@nuxtjs/pwa', '@nuxtjs/sentry', '@nuxtjs/sitemap'],

  pwa: {
    manifest: {
      name: 'Rule 34 App',
      short_name: 'Rule 34 App',
      lang: 'en',
      start_url: '/?utm_source=PWA',
      theme_color: '#121212',
      background_color: '#121212',
      shortcuts: [
        {
          name: 'Open Settings',
          short_name: 'Settings',
          description: 'Tweak your experience',
          url: '/settings?utm_source=PWA',
        },
      ],
    },
    meta: {
      /* meta options */
      ogHost: 'https://r34.app',
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

    disabled: process.env.SENTRY_ENABLED,
    disableClientSide: false,
    disableServerSide: true,

    publishRelease: true,
    sourceMapStyle: 'hidden-source-map',

    // Additional config
    config: {
      ignoreErrors: [
        'Request rejected with status',
        'Failed to fetch',
        'AbortError',
        'NotAllowedError',
        'Network',
        'ResizeObserver loop limit exceeded',
        'vue-matomo',
      ],
    },
  },

  sitemap: {
    hostname: 'https://r34.app',

    defaults: {
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date(),
    },

    // Static HTML files
    routes: [
      { url: '/', priority: 1.0 },
      { url: '/privacy-policy', priority: 0.6 },
      { url: '/terms-of-service', priority: 0.6 },
    ],
  },

  build: {
    extractCSS: true,
  },

  telemetry: false,
}
