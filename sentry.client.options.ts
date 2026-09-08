import type * as Sentry from '@sentry/nuxt'
import { project } from './config/project'

type SentryNuxtInitOptions = Parameters<typeof import('@sentry/nuxt').init>[0]

export const CHUNK_ERROR_SAMPLE_RATE = 0.01

export function buildSentryClientInitOptions(params: {
  dsn: string | undefined
  Sentry: typeof import('@sentry/nuxt')
  chunkErrorSampleRate?: number
}): SentryNuxtInitOptions {
  const { dsn, Sentry, chunkErrorSampleRate = CHUNK_ERROR_SAMPLE_RATE } = params

  const options: SentryNuxtInitOptions = {
    enabled: !import.meta.dev && !!dsn,

    dsn,

    tracesSampleRate: 0.2,

    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,

    integrations(defaultIntegrations) {
      const integrations = [
        ...defaultIntegrations,

        // Replay
        Sentry.replayIntegration({
          maskAllText: false,
          unblock: ['svg']
        }),

        // Drop errors which contain third-party frames (requires an application key).
        // This comes from Sentry core/browser and is re-exported by the Nuxt SDK.
        Sentry.thirdPartyErrorFilterIntegration({
          filterKeys: [project.sentry.applicationKey],
          behaviour: 'drop-error-if-contains-third-party-frames'
        })
      ]

      return integrations
    },

    beforeSend(event: Sentry.Event) {
      if (isInjectedCode(event)) {
        return null
      }

      if (isSafariNativeTrackMenuError(event)) {
        return null
      }

      if (isUnknownOrExtensionError(event)) {
        return null
      }

      if (isChunkLoadError(event)) {
        // Downsample chunk import failures to keep metric visibility without overwhelming Sentry
        if (Math.random() > chunkErrorSampleRate) {
          return null
        }

        event.tags = {
          ...event.tags,
          sampled_chunk_error: 'true',
          sample_rate: String(chunkErrorSampleRate)
        }
      }

      // The Nuxt Sentry SDK calls `beforeSend` for error events. The SDK typing
      // expects an ErrorEvent return type here, so we narrow accordingly.
      return event as Sentry.ErrorEvent
    },

    denyUrls,
    ignoreErrors
  }

  return options
}

const denyUrls: RegExp[] = [
  /**
   * @see https://github.com/fdev/sentry-ignores
   */
  // Specific files
  /fluid-player/i,

  // Facebook flakiness
  /graph\.facebook\.com/i,
  // Facebook blocked
  /connect\.facebook\.net\/en_US\/all\.js/i,
  // Woopra flakiness
  /eatdifferent\.com\.woopra-ns\.com/i,
  /static\.woopra\.com\/js\/woopra\.js/i,
  // Chrome extensions
  /^chrome(?:-extension)?:\/\//i,
  /^chrome-extension:\/\//i,
  // Criteo
  /criteo\.net/i,
  // Google
  /google-analytics\.com/i,
  /partner\.googleadservices\.com/i,
  /pagead2\.googlesyndication\.com/i,
  /apis\.google\.com/i,
  /doubleclick\.net/i,
  /googletagservices\.com/i,
  // Other extensions
  /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
  /webappstoolbarba\.texthelp\.com\//i,
  /metrics\.itunes\.apple\.com\.edgesuite\.net\//i
]

const ignoreErrors: (string | RegExp)[] = [
  // Build

  // Media
  'AbortError',
  'Request aborted',
  'Picture-in-Picture',
  'webkitExitFullScreen',
  'webkitExitFullscreen',
  'webkitEnterFullscreen',
  'InvalidStateError: The object is in an invalid state.',
  'NotSupportedError: The operation is not supported', // Safari not compatible video - https://stackoverflow.com/a/47976124

  // Network
  'Load failed',
  'Failed to fetch',

  // Player / Ad-block collisions
  "Cannot set properties of undefined (setting 'display')",

  // Service worker
  'Registration failed - no active Service Worker',
  'Background Sync is disabled.',

  // - Misc -
  'ResizeObserver loop limit exceeded',

  /**
   * @see https://github.com/fdev/sentry-ignores
   */
  // Random plugins and extensions.
  // http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
  'atomicFindClose',
  "Can't find variable: ZiteReader",
  'canvas.contentDocument',
  'ComboSearch is not defined',
  'http://loading.retry.widdit.com/',
  'http://tt.epicplay.com',
  'jigsaw is not defined',
  'miscellaneous_bindings',
  'MyApp_RemoveAllHighlights',
  'originalCreateNotification',
  'top.GLOBALS',

  // Generic error code from errors outside the security sandbox.
  'Script error.',

  // Analytics code.
  'vars.hotjar.com',
  'doubleclick.net',

  // Avast.
  '_avast_',

  // Facebook.
  'fb_xd_fragment',

  // Broadcom ASG error.
  'ICAP Error',

  // Bytemobile proxy.
  'bmi_SafeAddOnload',
  'EBCallBackMessageReceived',

  // Conduit Toolbar.
  'conduitPage',

  // Chrome for iOS bug.
  // https://groups.google.com/a/chromium.org/forum/#!topic/chromium-discuss/7VU0_VvC7mE
  '__gCrWeb',

  // Chromium bug.
  // https://bugs.chromium.org/p/chromium/issues/detail?id=97172
  'ntp is not defined',

  // Edge on iOS.
  'instantSearchSDKJSBridgeClearHighlight',

  // Firefox bug.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=783260
  // http://stackoverflow.com/a/13101119
  'Permission denied to access property "toString"',

  // Firefox internals.
  '_firefox_',

  // Firefox freeing add-on memory.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Dead_object
  "can't access dead object",

  // Nuance Dragon Web Extension.
  'plugin.setSuspendState',

  // Safari bug.
  // https://bugs.webkit.org/show_bug.cgi?id=119472
  'promiseReactionJob',

  // SafeBrowse extension.
  'jQSB',

  // Commonly ignored errors of unknown origin.
  'androidInterface',
  'eshopcomp',
  'eval at C',
  'eval at E_c',
  'frameConnector_isForegroundChanged',
  'harkedtremblings',
  'kw__injected',
  'NPObject',
  'siteroot',
  'SymBrowser_',
  'touchDownX',
  'uiWebview_',
  'variable: inf',
  'Window.dologin'
]

/**
 * Disable errors originating from injected scripts such as Google Tag Manager
 * @see https://github.com/getsentry/sentry-javascript/issues/3147#issuecomment-1782504804
 */
export function isInjectedCode(event: Sentry.Event | undefined): boolean {
  const frames = event?.exception?.values?.[0]?.stacktrace?.frames
  if (!frames || frames.length === 0) return false

  const firstFrame = frames[0]
  if (!firstFrame) return false

  if (firstFrame.filename === '<anonymous>') {
    return true
  }

  if (
    frames.some(
      (frame) =>
        typeof frame.filename === 'string' &&
        // Ignore errors from Partytown
        frame.filename.includes('partytown')
    )
  ) {
    return true
  }

  return false
}

export function isSafariNativeTrackMenuError(event: Sentry.Event | undefined): boolean {
  const frames = event?.exception?.values?.[0]?.stacktrace?.frames
  if (!frames || frames.length === 0) return false

  return frames.some((frame) => frame.function === 'sortedTrackListForMenu' && frame.filename === '[native code]')
}

export function isUnknownOrExtensionError(event: Sentry.Event | undefined): boolean {
  if (!event) return true

  const values = event.exception?.values
  if (!values || values.length === 0) {
    // Drop events with empty or generic opaque titles and no structured exception
    const message = typeof event.message === 'string' ? event.message.trim() : ''
    return !message || message === '<unknown>' || message === 'Script error.'
  }

  const first = values[0]
  const value = typeof first?.value === 'string' ? first.value.trim() : ''
  const type = typeof first?.type === 'string' ? first.type.trim() : ''

  if ((!value || value === '<unknown>') && (!type || type === '<unknown>')) {
    return true
  }

  if (value === 'Script error.' || type === 'Script error.') {
    return true
  }

  return false
}

export function isChunkLoadError(event: Sentry.Event | undefined): boolean {
  const values = event?.exception?.values
  if (!values || values.length === 0) {
    const message = typeof event?.message === 'string' ? event.message : ''
    return matchesChunkPattern(message)
  }

  const first = values[0]
  const value = typeof first?.value === 'string' ? first.value : ''
  const type = typeof first?.type === 'string' ? first.type : ''

  return matchesChunkPattern(value) || matchesChunkPattern(type)
}

function matchesChunkPattern(text: string): boolean {
  if (!text) return false
  return (
    /dynamically imported module/i.test(text) ||
    /importing a module script failed/i.test(text) ||
    /error loading dynamically imported module/i.test(text) ||
    /loading chunk \d+ failed/i.test(text) ||
    /loading css chunk \d+ failed/i.test(text) ||
    /unable to preload css/i.test(text)
  )
}
