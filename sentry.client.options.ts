import type * as Sentry from '@sentry/nuxt'
import { project } from './config/project'

type SentryNuxtInitOptions = Parameters<typeof import('@sentry/nuxt').init>[0]

export function buildSentryClientInitOptions(params: {
  dsn: string | undefined
  Sentry: typeof import('@sentry/nuxt')
}): SentryNuxtInitOptions {
  const { dsn, Sentry } = params

  const options: SentryNuxtInitOptions = {
    enabled: !import.meta.dev && !!dsn,

    dsn,

    tracesSampleRate: 0.2,

    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,

    integrations(defaultIntegrations: any[]) {
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
  /\/js\/popunder\.js/,
  /\/fluid-player\//i,

  // Random plugins and extensions.
  /^resource:\/\//i,
  /127\.0\.0\.1:4001\/isrunning/i,
  /bestpriceninja/i,
  /googleapis/i,
  /googlebot/i,
  /googlest/i,
  /itunes\.apple\.com\//i,
  /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
  /re-markit/i,
  /webappstoolbarba\.texthelp\.com\//i,

  // Analytics.
  /doubleclick\.net/i,
  /hotjar\./i,
  /netstats\.space/i,
  /pagead\/js/i,
  /posthog\.com/i,

  // Chrome extensions.
  /^chrome:\/\//i,
  /chrome-extension:/i,
  /extensions\//i,

  // Facebook.
  /connect\.facebook\.net\/en_US\/all\.js/i,
  /graph\.facebook\.com/i,

  // Kaspersky antivirus.
  /kaspersky/i,

  // Locally saved copies
  /file:\/\//i,

  // Proxy servers.
  /nph-proxy\./i,
  /\.cloudfront\..+\/statistic\//i,

  // Safari extensions.
  /safari-web-extension:/i,
  /safari-extension:/i
]

const ignoreErrors: string[] = [
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
