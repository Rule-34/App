import * as Sentry from '@sentry/nuxt'
import { useRuntimeConfig } from '#imports'
import { project } from './config/project'

const config = useRuntimeConfig()

Sentry.init({
  enabled: !import.meta.dev,

  dsn: config.public.sentryDsn,

  tracesSampleRate: 0.2,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      unblock: ['svg']
    }),

    Sentry.thirdPartyErrorFilterIntegration({
      filterKeys: [project.sentry.applicationKey],

      behaviour: 'drop-error-if-contains-third-party-frames'
    })
  ],

  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.5,

  denyUrls: [
    /**
     * @see https://github.com/fdev/sentry-ignores
     */
    // Specific files
    /\/js\/popunder\.js/,
  ],

  ignoreErrors: [
    // Build

    // Media
    'AbortError',
    'Request aborted',
    'Picture-in-Picture',
    'webkitExitFullScreen',
    'webkitExitFullscreen',
    'NotSupportedError: The operation is not supported', // Safari not compatible video - https://stackoverflow.com/a/47976124

    // Network

    // Service worker
    'Registration failed - no active Service Worker',

    // - Misc -
    'ResizeObserver loop limit exceeded',
  ]
})