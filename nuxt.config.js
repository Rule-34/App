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
    '/': {
      // Not prerendered because it needs to redirect old URLs
      // prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },

    '/posts/**': {
      // @see https://github.com/Baroshem/nuxt-security/issues/364
      security: {
        xssValidator: false
      },
      // TODO: Reactivate SWR once memory fix is found
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },

    // Static pages are prerendered
    '/other-sites': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },

    '/legal': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },

    '/privacy-policy': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },

    '/terms-of-service': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },

    '/cookie-policy': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },

    '/dmca': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },

    '/settings': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },

    '/premium': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },
    '/premium/sign-in': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },
    '/premium/forgot-password': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },

    // All premium pages are client-side rendered
    '/premium/dashboard': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },
    '/premium/saved-posts': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },
    '/premium/tag-collections': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },
    '/premium/additional-boorus': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },
    '/premium/backup': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
      }
    },

    /**
     * Public assets
     */
    '/icon.svg': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },

    '/favicon.ico': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },

    '/img/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },

    '/js/**': {
      headers: {
        'Cache-Control': 'public, max-age=86400'
      }
    }
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
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
    '@sentry/nuxt/module',
    'nuxt-headlessui',
    '@headlessui-float/nuxt',
    '@nuxt/image',
    '@nuxt/fonts',
    '@formkit/auto-animate/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
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
        'img-src': ["'self'", 'http:', 'https:', 'data:', 'blob:'],

        // Fix: enable fluid player fullscreen eval
        // @see https://nuxt-security.vercel.app/documentation/advanced/faq#cloudflare
        // @see https://nuxt-security.vercel.app/documentation/getting-started/configuration#defaults
        'script-src': ["'self'", 'https:', "'unsafe-inline'", "'strict-dynamic'", "'nonce-{{nonce}}'", "'unsafe-eval'"],

        // Fix: enable inline execution
        'script-src-attr': ["'unsafe-inline'"],

        // Fix: enable form submission
        'form-action': ["'self'", 'https:']
      },

      permissionsPolicy: {
        // Fix: enable full-screen
        fullscreen: ['self']
      }
    }
  },

  devtools: {
    enabled: false
  },

  telemetry: false
})
