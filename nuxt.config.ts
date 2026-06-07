import tailwindcss from '@tailwindcss/vite'
import * as nuxtLegacy from '@teages/nuxt-legacy'
import type { PluginOption } from 'vite'
import { project } from './config/project'
import { locales, defaultLocale, prefixedLocaleCodes } from './config/i18n'

const cacheHeaders = {
  'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=300, stale-if-error=0'
}

const immutableCacheHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable'
}

const assetCacheHeaders = {
  'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800'
}

function getExternalOrigin(value: string | undefined): string | null {
  const url = value ? URL.parse(value) : null

  if (!url) {
    return null
  }

  if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
    return null
  }

  return url.origin
}

const externalApiOrigin = getExternalOrigin(process.env.NUXT_PUBLIC_API_URL)

const resourceHints = [
  ...(externalApiOrigin
    ? [
        { rel: 'preconnect', href: externalApiOrigin },
        { rel: 'dns-prefetch', href: externalApiOrigin }
      ]
    : [])
]

const legacyUrlPolyfills = ['web.url.parse', 'web.url.can-parse']
const legacyUrlPolyfillImports = legacyUrlPolyfills.map((polyfill) => `core-js/modules/${polyfill}.js`)
const legacyCspHashes = (nuxtLegacy as unknown as { cspHashes: string[] }).cspHashes
const legacyCspHashSources = [...new Set(legacyCspHashes.map((hash) => `'sha256-${hash}'`))]

const shouldUploadSentrySourceMaps =
  process.env.SENTRY_UPLOAD_SOURCE_MAPS === 'true' &&
  Boolean(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN)

const pageRouteRules = {
  // Not prerendered because it needs to redirect old URLs
  '/': { headers: cacheHeaders },

  // @see https://github.com/Baroshem/nuxt-security/issues/364
  '/posts/**': { security: { xssValidator: false as const }, headers: cacheHeaders },
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

const mirroredRouteRules = (rules: typeof pageRouteRules) =>
  Object.fromEntries(
    prefixedLocaleCodes.flatMap((locale) =>
      Object.entries(rules).map(([path, rule]) => [path === '/' ? `/${locale}` : `/${locale}${path}`, rule])
    )
  )

export default defineNuxtConfig({
  ssr: true,
  spaLoadingTemplate: true,

  features: {
    inlineStyles: false
  },

  app: {
    head: {
      style: [
        {
          innerHTML: `html { background-color: ${project.branding.colors.background}; }`
        }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', href: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },

        ...resourceHints
      ],
      meta: [
        { name: 'rating', content: 'adult' },

        { name: 'color-scheme', content: 'dark' },
        { name: 'theme-color', content: project.branding.colors.background },

        { name: 'monetization', content: '$ilp.uphold.com/Hf3zAn3pQ7fD' }
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

    // Locale-prefixed variants (ru, es, ja, pt, de, fr) — with prefix_except_default,
    // /ru/posts/** etc. don't inherit unprefixed rules.
    ...mirroredRouteRules(pageRouteRules),

    /**
     * Public assets
     */
    '/icon.svg': {
      headers: assetCacheHeaders
    },

    '/favicon.ico': {
      headers: assetCacheHeaders
    },

    '/apple-touch-icon-180x180.png': {
      headers: assetCacheHeaders
    },

    '/pwa-64x64.png': {
      headers: assetCacheHeaders
    },

    '/pwa-192x192.png': {
      headers: assetCacheHeaders
    },

    '/pwa-512x512.png': {
      headers: assetCacheHeaders
    },

    '/maskable-icon-512x512.png': {
      headers: assetCacheHeaders
    },

    '/img/**': {
      headers: immutableCacheHeaders
    },

    '/_i18n/**': {
      headers: immutableCacheHeaders
    },

    '/js/**': {
      headers: assetCacheHeaders
    },

    '/social.jpg': {
      headers: assetCacheHeaders
    }
  },

  experimental: {
    // @see https://nuxt.com/docs/guide/going-further/experimental-features#emitroutechunkerror
    emitRouteChunkError: 'automatic-immediate',

    defaults: {
      nuxtLink: {
        // Post pages contain many internal SEO links; eager route prefetching adds avoidable client and server work.
        prefetch: false
      }
    }
  },

  nitro: {
    esbuild: {
      options: {
        // This only affects the Nitro/server bundle (SSR + `server/*` routes/middleware).
        target: 'esnext'
      }
    }
  },

  vite: {
    plugins: [tailwindcss() as unknown as PluginOption],

    ssr: {
      // Keep TanStack Vue packages inside Vite's SSR module graph so their Vue scope APIs
      // see Nuxt's active setup/effect scope during dev SSR.
      noExternal: ['@tanstack/vue-query', '@tanstack/vue-virtual']
    }
  },

  sourcemap: shouldUploadSentrySourceMaps ? { client: 'hidden' } : false,

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
    '@nuxt/eslint',
    '@teages/nuxt-legacy',
    '@sentry/nuxt/module',
    'nuxt-headlessui',
    '@nuxt/image',
    '@vite-pwa/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/i18n',
    'nuxt-schema-org',
    'nuxt-security'
  ],

  /** @type {import('@nuxtjs/i18n').ModuleOptions} */
  i18n: {
    baseUrl: project.urls.production.toString(),

    locales: [...locales],
    defaultLocale,

    parallelPlugin: true,

    bundle: {
      // Tree-shake unused i18n components (<i18n-d>, <i18n-n>, v-t).
      // <i18n-t> is converted to $t() so it can also be removed — see tag-collections.vue.
      fullInstall: false
    },

    /**
     * BUG: canonicalQueries is ignored by @nuxtjs/i18n v10 (up to 10.3.0).
     * The config array is discarded at build time and never reaches the runtime.
     *
     * WORKAROUND (two-part fix):
     *   1. SSR: server/plugins/fix-canonical-queries.ts patches the canonical
     *      link into the rendered HTML before it reaches the browser.
     *   2. CSR: app/pages/posts/[domain]/index.vue uses `useHead` to re-apply the
     *      canonical after the i18n module overwrites it on client hydration.
     *
     * TODO: Remove both parts once upstream fixes canonicalQueries.
     *       Track: https://github.com/nuxt-modules/i18n
     */
    experimental: {
      prerenderMessages: true,

      strictSeo: {
        canonicalQueries: ['tags'] // Non-functional — kept as intent. See server/plugins/.
      },
      
      compactRoutes: true // TODO: Remove once default
    }
  },

  /** @type {import('@sentry/nuxt/module').ModuleOptions} */
  sentry: {
    // Ensure server-side Sentry is actually preloaded without requiring `node --import ...`
    autoInjectServerSentry: 'experimental_dynamic-import',
    sourceMapsUploadOptions: {
      enabled: shouldUploadSentrySourceMaps,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,

      telemetry: false
    },

    unstable_sentryBundlerPluginOptions: {
      applicationKey: project.sentry.applicationKey
    }
  },

  legacy: {
    vite: {
      // Usage-based floor that keeps the meaningful old-browser tail without carrying an AbortController polyfill.
      targets: ['> 0.2% and supports abortcontroller', 'not dead', 'not IE 11'],
      modernPolyfills: legacyUrlPolyfills,
      additionalLegacyPolyfills: legacyUrlPolyfillImports
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
        provider: '~/assets/js/nuxt-image/imgproxy.provider',
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
      enabled: process.env.NODE_ENV !== 'production',
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  },

  schemaOrg: {
    defaults: false
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
        'script-src': [
          "'self'",
          'https:',
          "'unsafe-inline'",
          "'strict-dynamic'",
          "'nonce-{{nonce}}'",
          "'unsafe-eval'",
          ...legacyCspHashSources
        ],

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
    enabled: process.env.NODE_ENV !== 'production'
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
        apiUrl: '' // routes $fetch(baseURL: '') to local Nitro server
      }
    },

    nitro: {
      plugins: ['~~/test/server-mocks/plugin.ts']
    }
  }
})
