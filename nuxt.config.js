import tailwindcss from '@tailwindcss/vite'
import { project } from './config/project'
import { locales, defaultLocale, prefixedLocaleCodes } from './config/i18n'

const cacheHeaders = { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=300, stale-if-error=0' }

const pageRouteRules = {
  // Not prerendered because it needs to redirect old URLs
  '/': { headers: cacheHeaders },

  // @see https://github.com/Baroshem/nuxt-security/issues/364
  '/posts/**': { security: { xssValidator: false }, headers: cacheHeaders },

  // Static pages (prerendered)
  '/other-sites': { prerender: true, headers: cacheHeaders },
  '/legal': { prerender: true, headers: cacheHeaders },
  '/privacy-policy': { prerender: true, headers: cacheHeaders },
  '/terms-of-service': { prerender: true, headers: cacheHeaders },
  '/cookie-policy': { prerender: true, headers: cacheHeaders },
  '/dmca': { prerender: true, headers: cacheHeaders },

  '/settings': { ssr: false, headers: cacheHeaders },

  '/premium': { prerender: true, headers: cacheHeaders },
  '/premium/sign-in': { prerender: true, headers: cacheHeaders },
  '/premium/forgot-password': { prerender: true, headers: cacheHeaders },

  // Premium dashboard pages (client-side rendered)
  '/premium/dashboard': { ssr: false, headers: cacheHeaders },
  '/premium/saved-posts/**': { ssr: false, headers: cacheHeaders },
  '/premium/tag-collections': { ssr: false, headers: cacheHeaders },
  '/premium/additional-boorus': { ssr: false, headers: cacheHeaders },
  '/premium/backup': { ssr: false, headers: cacheHeaders }
}

const mirroredRouteRules = (rules) =>
  Object.fromEntries(
    prefixedLocaleCodes.flatMap((locale) =>
      Object.entries(rules).map(([path, rule]) => [
        path === '/' ? `/${locale}` : `/${locale}${path}`,
        rule
      ])
    )
  )

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
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', href: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },

        ...(process.env.NUXT_PUBLIC_API_URL
          ? [{ rel: 'preconnect', href: process.env.NUXT_PUBLIC_API_URL }]
          : [])
      ],
      meta: [
        { name: 'rating', content: 'adult' },

        { name: 'color-scheme', content: 'dark' },
        { name: 'theme-color', content: project.branding.colors.background },

        { name: 'monetization', content: '$ilp.uphold.com/Hf3zAn3pQ7fD' },

        { property: 'og:image', content: '/social.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' }
      ]
    }
  },

  /**
   * @see https://nuxt.com/docs/guide/concepts/rendering#route-rules
   */
  routeRules: {
    // Redirect public disabled Boorus to / to not lose SEO
    // @see useBooruList.ts
    // '/posts/gelbooru.com': {
    //   redirect: '/posts/rule34.xxx'
    // },

    ...pageRouteRules,

    // Locale-prefixed variants (ru, es, ja) — with prefix_except_default,
    // /ru/posts/** etc. don't inherit unprefixed rules.
    ...mirroredRouteRules(pageRouteRules),

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
    '@nuxtjs/i18n',
    'nuxt-schema-org',
    'nuxt-security'
  ],

  /** @type {import('@nuxtjs/i18n').ModuleOptions} */
  i18n: {
    baseUrl: project.urls.production.toString(),

    locales,
    defaultLocale,

    parallelPlugin: true,

    /**
     * BUG: canonicalQueries is ignored by @nuxtjs/i18n v10 (up to 10.3.0).
     * The config array is discarded at build time and never reaches the runtime.
     *
     * WORKAROUND (two-part fix):
     *   1. SSR: server/plugins/fix-canonical-queries.ts patches the canonical
     *      link into the rendered HTML before it reaches the browser.
     *   2. CSR: pages/posts/[domain].vue uses `useHead` to re-apply the
     *      canonical after the i18n module overwrites it on client hydration.
     *
     * TODO: Remove both parts once upstream fixes canonicalQueries.
     *       Track: https://github.com/nuxt-modules/i18n
     */
    experimental: {
      strictSeo: {
        canonicalQueries: ['tags'] // Non-functional — kept as intent. See server/plugins/.
      },
      compactRoutes: true // TODO: Remove once default
    }
  },

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
          baseUrl: project.imgproxy.baseUrl,
          internalProxyUrl: project.imgproxy.internalProxyUrl
        }
      }
    },

    ipx: {
      maxAge: 60 * 60 * 24 * 365 // 1 year
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
  compatibilityDate: '2025-03-12',

  /** Test overrides — only applied when running vitest. */
  $test: {
    sentry: {
      enabled: false
    },

    runtimeConfig: {
      public: {
        apiUrl: '', // routes $fetch(baseURL: '') to local Nitro server
        testAuthBypass: true
      }
    },

    nitro: {
      plugins: ['~/test/server-mocks/plugin.ts']
    }
  }
})
