import * as Sentry from '@sentry/nuxt'
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()

Sentry.init({
  enabled: !import.meta.dev,

  dsn: config.public.SENTRY_DSN,

  tracesSampleRate: 1.0,

  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,

  beforeSend(event, hint) {
    if (isInjectedCode(event)) {
      return null
    }

    return event
  },

  denyUrls: [
    /**
     * @see https://github.com/fdev/sentry-ignores
     */
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
  ],

  ignoreErrors: [
    // Build

    // Media
    'AbortError',
    'Request aborted',
    'Picture-in-Picture',
    'webkitExitFullScreen',
    'NotSupportedError: The operation is not supported', // Safari not compatible video - https://stackoverflow.com/a/47976124

    // Network

    // - Misc -

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
})

/**
 *  Disable errors originating from injected scripts such as Google Tag Manager
 *  @see https://github.com/getsentry/sentry-javascript/issues/3147#issuecomment-1782504804
 **/
function isInjectedCode(event: Sentry.Event | undefined): boolean {
  const frames = event?.exception?.values?.[0]?.stacktrace?.frames

  if (!frames || frames.length === 0) return false

  const firstFrame = frames[0]

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
