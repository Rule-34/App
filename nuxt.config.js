import tailwindcss from '@tailwindcss/vite'
import { project } from './config/project.ts'

export default defineNuxtConfig({
  ssr: true,
  spaLoadingTemplate: true,

  app: {
    head: {
      style: [
        {
          type: 'text/css',
          children: `html { background-color: ${project.branding.colors.background}; }`
        }
      ],

      script: [
        /**
         * Matomo
         */
        {
          type: 'text/partytown',
          innerHTML: `
var _paq = (window._paq = window._paq || [])

_paq.push(['setDomains', ['*.r34.app']])
_paq.push(['enableCrossDomainLinking'])

_paq.push(['setExcludedQueryParams', ['page', 'cursor']])

;(function () {
  var u = 'https://matomo.akbal.dev/'

  _paq.push(['setTrackerUrl', u + 'matomo.php'])
  _paq.push(['setSiteId', '1'])
})()`
        },
        { src: 'https://matomo.akbal.dev/matomo.js', type: 'text/partytown', async: true, defer: true },
        /**
         * Formbricks User Experience
         */
        ...(project.analytics?.formbricksEnvironmentId && project.analytics?.formbricksAppUrl
          ? [
              {
                type: 'text/partytown',
                innerHTML: `
!function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="${project.analytics.formbricksAppUrl}/js/formbricks.umd.cjs",t.onload=function(){window.formbricks?window.formbricks.setup({environmentId:"${project.analytics.formbricksEnvironmentId}",appUrl:"${project.analytics.formbricksAppUrl}"}):console.error("Formbricks library failed to load properly. The formbricks object is not available.");};var e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(t,e)}();
`
              }
            ]
          : [])
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
    '/premium/saved-posts/**': {
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

  experimental: {
    // @see https://nuxt.com/docs/guide/going-further/experimental-features#emitroutechunkerror
    emitRouteChunkError: 'automatic-immediate'
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

  vite: {
    plugins: [tailwindcss()]
  },

  sourcemap: true,

  runtimeConfig: {
    MATOMO_API_KEY: process.env.MATOMO_API_KEY,

    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,

    public: {
      NODE_ENV: process.env.NODE_ENV,

      API_URL: process.env.API_URL,

      SENTRY_DSN: process.env.SENTRY_DSN
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
    '@headlessui-float/nuxt',
    'vue-sonner/nuxt',
    '@nuxt/image',
    '@nuxt/fonts',
    '@formkit/auto-animate/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/partytown',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
    'nuxt-security'
  ],

  /** @type {import('@sentry/nuxt/module').ModuleOptions} */
  sentry: {
    sourceMapsUploadOptions: {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,

      telemetry: false
    }
  },

  image: {
    ipx: {
      maxAge: 60 * 60 * 24 * 365 // 1 year
    },

    providers: {
      imgproxy: {
        name: 'imgproxy',
        provider: '~~/assets/js/nuxt-image/imgproxy.provider',
        options: {
          baseURL: `https://imgproxy.${project.urls.production.hostname}`
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

  partytown: {
    forward: [
      // Matomo
      '_paq.push',
      // Formbricks
      'formbricks.track'
    ]
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
