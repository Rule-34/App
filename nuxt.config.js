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
    title: null,

    titleTemplate: (titleChunk) => {
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
        content:
          'Browse the most popular Rule 34 Hentai porn with the Rule 34 App.',
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

  components: [{ path: '~/components', pathPrefix: false }],

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

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/pwa',
    '@nuxtjs/sentry',
    '@nuxtjs/sitemap',
  ],

  axios: {
    progress: true,
  },

  auth: {
    strategies: {
      local: {
        scheme: 'refresh',

        token: {
          type: 'Bearer',
          property: 'access_token',
          required: true,
          maxAge: 1800, // 30 minutes
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

    redirect: {
      login: '/premium',
      logout: '/premium',
      callback: false,
      home: false,
    },

    watchLoggedIn: true,

    vuex: { namespace: 'authentication' },
  },

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

    disabled: process.env.SENTRY_DISABLED,
    disableClientSide: false,
    disableServerSide: true,

    // publishRelease: true,
    // sourceMapStyle: 'hidden-source-map',

    config: {
      ignoreErrors: [
        // Network
        'Fetch',
        'Request',
        'Network',

        'URL',

        // Plugins
        'vue-matomo',

        // Misc
        'native code',
        'extension',
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
