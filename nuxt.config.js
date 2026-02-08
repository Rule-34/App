import tailwindcss from '@tailwindcss/vite'
import { project } from './config/project'

export default defineNuxtConfig({
  srcDir: '.',

  dir: {
    app: 'app'
  },

  ssr: true,
  spaLoadingTemplate: true,

  features: {
    inlineStyles: true
  },

  app: {
    head: {
      style: [
        {
          type: 'text/css',
          children: `html { background-color: ${project.branding.colors.background}; }`
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
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },

    // Redirect public disabled Boorus to / to not lose SEO
    // @see useBooruList.ts
    // '/posts/gelbooru.com': {
    //   redirect: '/posts/rule34.xxx'
    // },

    '/posts/**': {
      // @see https://github.com/Baroshem/nuxt-security/issues/364
      security: {
        xssValidator: false
      },
      // TODO: Reactivate SWR once memory fix is found
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },

    // Static pages are prerendered
    '/other-sites': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },

    '/legal': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },

    '/privacy-policy': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },

    '/terms-of-service': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },

    '/cookie-policy': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },

    '/dmca': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },

    '/settings': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },

    '/premium': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },
    '/premium/sign-in': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },
    '/premium/forgot-password': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },

    // All premium pages are client-side rendered
    '/premium/dashboard': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },
    '/premium/saved-posts/**': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },
    '/premium/tag-collections': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },
    '/premium/additional-boorus': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
      }
    },
    '/premium/backup': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0'
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

  experimental: {
    // @see https://nuxt.com/docs/guide/going-further/experimental-features#emitroutechunkerror
    emitRouteChunkError: 'automatic-immediate'
  },

  nitro: {
    plugins: ['~/server/plugins/lcp-preload-fetchpriority'],

    esbuild: {
      options: {
        // This only affects the Nitro/server bundle (SSR + `server/*` routes/middleware).
        target: 'esnext'
      }
    }
  },

  vite: {
    plugins: [tailwindcss()]
  },

  sourcemap: { client: 'hidden' },

  runtimeConfig: {
    matomoApiKey: undefined,

    public: {
      apiUrl: undefined,
      sentryDsn: undefined
    }
  },

  css: ['~/assets/css/main.css'],
  components: [{ path: '~/components', pathPrefix: false }],

  site: {
    url: project.urls.production.toString()
  },

  /**
   * Loaded in order
   */
  modules: [
    '@sentry/nuxt/module',
    'nuxt-headlessui',
    'vue-sonner/nuxt',
    '@nuxt/image',
    '@formkit/auto-animate/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
    'nuxt-security'
  ],

  /**
   * vue-sonner
   * Disable global CSS injection so it doesn't end up in the main SSR inline <head> styles.
   * We'll lazy-load `vue-sonner/style.css` on the client (see `layouts/default.vue`).
   */
  vueSonner: {
    css: false
  },

  /** @type {import('@sentry/nuxt/module').ModuleOptions} */
  sentry: {
    // Ensure server-side Sentry is actually preloaded without requiring `node --import ...`
    autoInjectServerSentry: 'experimental_dynamic-import',
    sourceMapsUploadOptions: {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,

      telemetry: false
    },

    unstable_sentryBundlerPluginOptions: {
      applicationKey: project.sentry.applicationKey
    }
  },

  /** @type {import('@nuxt/image').ModuleOptions} */
  image: {
    /**
     * Limited screen sizes to reduce bandwidth and compute usage
     * @see https://image.nuxt.com/get-started/configuration#screens
     */
    screens: {
      sm: 400,
      md: 768,
      lg: 1200
    },

    /**
     * Intentionally generate only 1x assets to reduce image variants (CPU/storage/cache/bandwidth).
     */
    densities: [1],

    // Force conversion to webp, since its way faster to convert than avif
    format: ['webp'],

    providers: {
      imgproxy: {
        name: 'imgproxy',
        provider: '~~/assets/js/nuxt-image/imgproxy.provider',
        options: {
          baseURL: `https://imgproxy.${project.urls.production.hostname}`
        }
      }
    },

    ipx: {
      maxAge: 60 * 60 * 24 * 365 // 1 year
    },

    bunny: {
      baseURL: 'https://b-cdn.r34.app',

      modifiers: {
        // Fix: always add this to every image URL to force optimization
        optimizer: 'image'
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
      name: project.name,
      short_name: project.shortName,
      description: project.description,

      scope: '/',
      lang: 'en',

      start_url: '/?utm_source=pwa',

      theme_color: project.branding.colors.background,
      background_color: project.branding.colors.background,

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
          url: `/premium/saved-posts/${project.urls.production.hostname}?utm_source=pwa&utm_medium=shortcut`
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

  /** @type {import('nuxt-security').ModuleOptions} */
  security: {
    // Rate limiting is at infraestructure level (Cloudflare/Traefik)
    rateLimiter: false,

    headers: {
      contentSecurityPolicy: {
        // Fix: disable HTTPS upgrade on development, otherwise Safari will fail to load the page
        'upgrade-insecure-requests': process.env.NODE_ENV === 'production',

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
    enabled: true
  },

  telemetry: false,
  compatibilityDate: '2025-03-12'
})
