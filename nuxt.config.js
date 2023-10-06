import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
	// https://nuxt.com/docs/getting-started/deployment#static-hosting
	ssr: false,

	nitro: {
		esbuild: {
			options: {
				target: 'esnext'
			}
		},

		prerender: {
			crawlLinks: true
		}
	},

	site: {
		url: `https://${ process.env.APP_DOMAIN }`
	},

	runtimeConfig: {
		MATOMO_API_KEY: process.env.MATOMO_API_KEY,

		public: {
			NODE_ENV: process.env.NODE_ENV,

			APP_DOMAIN: process.env.APP_DOMAIN,

			API_URL: process.env.API_URL,

			PROXY_URL: process.env.PROXY_URL,

			MATOMO_HOST: process.env.MATOMO_HOST,
			MATOMO_SITE_ID: process.env.MATOMO_SITE_ID,

			MONETIZATION_URI: process.env.MONETIZATION_URI
		}
	},

	css: ['~/assets/css/main.css'],

	components: [{ path: '~/components', pathPrefix: false }],

	modules: [
		'@sidebase/nuxt-auth',

		// '@nuxtjs/sentry',

		'nuxt-schema-org',

		'@vite-pwa/nuxt',

		'nuxt-simple-sitemap'
	],

	/** @type {import('@sidebase/nuxt-auth')} */
	auth: {
		// TODO: Refresh token

		baseURL: process.env.API_URL + '/auth',

		provider: {
			type: 'local',

			endpoints: {
				signIn: { path: '/log-in', method: 'post' },
				signOut: null,
				signUp: null,

				getSession: { path: '/profile', method: 'get' }
			},

			pages: {
				login: '/premium/sign-in'
			},

			token: {
				signInResponseTokenPointer: '/access_token',

				type: 'Bearer',

				maxAgeInSeconds: 1800 // 30 minutes
			},

			sessionDataType: {
				email: 'string',

				is_subscription_valid: 'boolean',

				license_uses: 'number',

				sale_timestamp: 'string'
			}
		}
	},

	/** @type {import('@vite-pwa/nuxt').ModuleOptions} */
	pwa: {
		// strategies: 'injectManifest',
		strategies: 'generateSW',

		registerType: 'autoUpdate',

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
					url: '/premium/saved-posts?utm_source=pwa&utm_medium=shortcut'
				}
			]
		},

		workbox: {
			navigateFallback: '/',
			globPatterns: ['**/*.{js,css,html,png,svg,ico}']
		},

		client: {
			installPrompt: true
			// you don't need to include this: only for testing purposes
			// if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
			// , periodicSyncForUpdates: 3600
		},

		selfDestroying: true,

		devOptions: {
			enabled: true,
			suppressWarnings: true,
			navigateFallbackAllowlist: [/^\/$/],
			type: 'module'
		}
	},

	/** @type {import('@nuxtjs/sentry')} */
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
				'ReportingObserver [deprecation]: \'Event.path\' is deprecated and will be removed in M109',
				'ReportingObserver [deprecation]: \'window.webkitStorageInfo\' is deprecated.',
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

	/** @type {import('nuxt-simple-sitemap').ModuleOptions} */
	sitemap: {
		discoverImages: false,

		credits: false,

		sitemaps: {
			pages: {
				defaults: {
					priority: 0.7,
					changefreq: 'weekly'
					// lastmod: new Date()
				}
			}
		}
	},

	routeRules: {
		'/posts': {
			sitemap: {
				priority: 1,
				changefreq: 'always'
			}
		}
	},

	build: {
		transpile: ['vue-sonner']
	},

	sourcemap: {
		server: true,
		client: true
	},

	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {}
		}
	},

	telemetry: false
})
