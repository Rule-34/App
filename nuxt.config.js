import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineNuxtConfig({
  // TODO: Enable SSR and pre-rendering when Nuxt-Auth supports it
  ssr: false,

  /**
   * @see https://nuxt.com/docs/guide/concepts/rendering#route-rules
   */
  routeRules: {
    //   '/posts/*': {
    //     // Incremental Static Regeneration for 5 minutes
    //     // isr: 60 * 5,
    //
    //     // TODO: Change when Cloudflare Pages supports ISR
    //     ssr: false
    //   },
    //
    //   // Static pages are prerendered
    //   '/': { prerender: true },
    //   '/other-sites': { prerender: true },
    //   '/legal': { prerender: true },
    //
    //   '/settings': { ssr: false },
    //
    //   '/premium': { prerender: true },
    //   '/premium/sign-in': { prerender: true },
    //
    //   // All premium pages are client-side rendered
    //   '/premium/dashboard': { ssr: false },
    //   '/premium/saved-posts/*': { ssr: false },
    //   '/premium/tag-collections': { ssr: false },
    //   '/premium/additional-boorus': { ssr: false },
    //   '/premium/backup': { ssr: false },
    //   '/premium/migrate-old-data': { ssr: false }

    // Public assets
    '/img/*': {
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

  vite: {
    plugins: [
      // Put the Sentry vite plugin after all other plugins
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: 'alejandro-akbal',
        project: 'app',
        url: 'https://glitchtip.akbal.dev/'
      })
    ]
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

      PROXY_URL: process.env.PROXY_URL,

      SENTRY_DSN: process.env.SENTRY_DSN
    }
  },

  css: ['~/assets/css/main.css'],

  components: [{ path: '~/components', pathPrefix: false }],

  site: {
    url: `https://${process.env.APP_DOMAIN}`
  },

  modules: [
    'nuxt-headlessui',

    '@headlessui-float/nuxt',

    '@nuxt-alt/auth',

    '@formkit/auto-animate/nuxt',

    '@nuxtjs/partytown',

    '@vite-pwa/nuxt',

    'nuxt-schema-org',

    '@nuxtjs/sitemap'
  ],

  image: {
    domains: [
      //
      process.env.APP_DOMAIN,
      'localhost',
      'localhost:8081',
      'www.google.com'
    ]
  },

  /** @type {import('@nuxt-alt/auth').ModuleOptions} */
  auth: {
    redirect: {
      login: '/premium/sign-in',
      logout: '/premium',
      home: '/premium/dashboard'
    },

    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'access_token',
          maxAge: 60 * 60, // 60 minutes
          global: false
        },
        refreshToken: {
          property: 'refresh_token',
          data: 'refresh_token',
          maxAge: 60 * 60 * 24 * 90 // 90 days
        },
        user: {
          property: false
        },
        endpoints: {
          login: { url: process.env.API_URL + '/auth/log-in', method: 'post' },
          refresh: { url: process.env.API_URL + '/auth/refresh', method: 'post' },
          user: { url: process.env.API_URL + '/auth/profile', method: 'get' },
          logout: false
        }
      }
    }
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

  /**
   * Also
   * @see matomo.client.ts
   */
  partytown: {
    forward: ['_paq.push']
  },

  app: {
    head: {
      script: [
        // Matomo
        {
          type: 'text/partytown',
          children: `
          var _paq = window._paq = window._paq || [];

          _paq.push(["disableCookies"]);

          _paq.push(['setTrackerUrl', 'https://matomo.akbal.dev/matomo.php']);
          _paq.push(['setSiteId', '1']);
        `
        },
        {
          type: 'text/partytown',
          src: 'https://matomo.akbal.dev/matomo.js',
          async: true
        }
      ]
    }
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

  devtools: {
    enabled: false
  },

  telemetry: false
})
