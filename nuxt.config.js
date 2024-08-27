export default defineNuxtConfig({
  ssr: true,

  spaLoadingTemplate: true,

  app: {
    head: {
      bodyAttrs: {
        class: 'cc--custom'
      },

      style: [
        {
          type: 'text/css',
          children: 'html { background-color: black; }'
        }
      ],

      script: [
        // Matomo
        {
          src: '/js/matomo.js',
          type: 'text/plain',
          'data-category': 'analytics',
          'data-service': 'matomo'
        },
        {
          src: 'https://matomo.akbal.dev/matomo.js',
          type: 'text/plain',
          'data-category': 'analytics',
          'data-service': 'matomo'
        }
      ]
    }
  },

  /**
   * @see https://nuxt.com/docs/guide/concepts/rendering#route-rules
   */
  routeRules: {
    // '/': { prerender: true },
    '/': { ssr: false },

    // 5 minutes
    // TODO: Reactivate once memory fix is found
    // '/posts/**': { swr: 60 * 5 },

    // Static pages are prerendered
    '/other-sites': { prerender: true },
    '/legal': { prerender: true },

    '/settings': { ssr: false },

    '/premium': { prerender: true },
    '/premium/sign-in': { prerender: true },
    '/premium/forgot-password': { prerender: true },

    // All premium pages are client-side rendered
    '/premium/dashboard': { ssr: false },
    '/premium/saved-posts': { ssr: false },
    '/premium/tag-collections': { ssr: false },
    '/premium/additional-boorus': { ssr: false },
    '/premium/backup': { ssr: false },

    // Public assets
    '/img/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    }
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    },

    prerender: {
      // crawlLinks: true
      // routes: ['/sitemap.xml', '/robots.txt']
    }
  },

  build: {
    transpile: ['vue-sonner']
  },

  sourcemap: true,

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  runtimeConfig: {
    MATOMO_API_KEY: process.env.MATOMO_API_KEY,

    public: {
      NODE_ENV: process.env.NODE_ENV,

      APP_DOMAIN: process.env.APP_DOMAIN,

      API_URL: process.env.API_URL,

      SENTRY_DSN: process.env.SENTRY_DSN
    }
  },

  css: ['~/assets/css/main.css', '~/assets/css/cookieconsent.css'],

  components: [{ path: '~/components', pathPrefix: false }],

  site: {
    url: `https://${process.env.APP_DOMAIN}`
  },

  /**
   * Loaded in order
   */
  modules: [
    'nuxt-headlessui',

    '@headlessui-float/nuxt',

    '@nuxt/image',

    '@nuxt/fonts',

    '@formkit/auto-animate/nuxt',

    '@vite-pwa/nuxt',

    '@nuxtjs/sitemap',
    'nuxt-schema-org'
    'nuxt-security'
  ],

  image: {
    provider: 'imgproxy',

    providers: {
      imgproxy: {
        name: 'imgproxy',
        provider: '~~/assets/js/nuxt-image/imgproxy.provider',
        options: {
          baseURL: 'https://imgproxy.r34.app'
        }
      }
    },

    format: ['avif', 'webp']
  },

  /** @type {import('@vite-pwa/nuxt').ModuleOptions} */
  pwa: {
    // Disable service worker, fuck it
    selfDestroying: true,

    strategies: 'generateSW',

    registerType: 'autoUpdate',

    registerWebManifestInRouteRules: true,

    manifest: {
      name: 'Rule 34 App',
      short_name: 'R34 App',

      scope: '/',
      lang: 'en',

      start_url: '/?utm_source=pwa',

      theme_color: '#000000',
      background_color: '#000000',

      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],

      shortcuts: [
        {
          name: 'Settings',
          url: '/settings?utm_source=pwa&utm_medium=shortcut'
        },
        {
          name: 'Saved Posts',
          url: '/premium/saved-posts/r34.app?utm_source=pwa&utm_medium=shortcut'
        }
      ]
    },

    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],

      cleanupOutdatedCaches: true
    },

    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  },

  schemaOrg: {
    default: false
  },

  /** @type {import('@nuxtjs/sitemap').ModuleOptions} */
  sitemap: {
    autoLastmod: true,

    discoverImages: false,

    defaults: {
      changefreq: 'weekly',
      priority: 0.6
    },

    sources: ['/api/_sitemap-urls'],

    experimentalWarmUp: true,

    credits: false
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        // Fix: enable any origin for images
        'img-src': ['*']
      }
    }
  },

  devtools: {
    enabled: false
  },

  telemetry: false
})
