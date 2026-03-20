import { default as randomWeightedChoice } from 'random-weighted-choice'

const AD_POPUP_CAP_DURATION_MS = 30 * 60 * 1000
const AD_LAST_POPUP_AT_STORAGE_KEY = 'ads-last-popup-at'
// Temporary debug toggles for popup-cap behavior:
// - window.__ADS_POPUP_GUARD_DEBUG__ = true
// - localStorage.setItem('ads-popup-guard-debug', '1')
const AD_POPUP_DEBUG_STORAGE_KEY = 'ads-popup-guard-debug'
const AD_POPUP_DEBUG_WINDOW_FLAG = '__ADS_POPUP_GUARD_DEBUG__'
const STACK_URL_REGEX = /https?:\/\/[^\s)]+/g
const DEBUG_TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'on'])

type WindowOpenArgs = Parameters<Window['open']>
type WindowOpenResult = ReturnType<Window['open']>
type PopupCapState = {
  isActive: boolean
  lastPopupAt: number | null
  elapsedSinceLastPopupMs: number | null
}
type VendorPopupMatchReason = 'cross-origin-script' | 'same-origin-js-script' | 'no-user-activation'

function getScriptUrlsFromStack(stack?: string): URL[] {
  if (!stack) {
    return []
  }

  const matches = stack.match(STACK_URL_REGEX)

  if (!matches) {
    return []
  }

  const urls: URL[] = []

  for (const rawMatch of matches) {
    const normalizedUrl = rawMatch
      .replace(/[),]$/, '')
      .replace(/:\d+:\d+$/, '')

    try {
      urls.push(new URL(normalizedUrl))
    } catch {
      // Ignore malformed URLs from stack traces
    }
  }

  return urls
}

function getVendorPopupMatchReason(
  callerScriptUrls: URL[],
  hasUserActivation: boolean
): VendorPopupMatchReason | null {
  if (callerScriptUrls.length === 0) {
    return hasUserActivation ? null : 'no-user-activation'
  }

  const currentOrigin = window.location.origin

  for (const scriptUrl of callerScriptUrls) {
    if (scriptUrl.origin !== currentOrigin) {
      return 'cross-origin-script'
    }

    // Keep the heuristic broad: treat same-origin static /js scripts as likely ad/vendor callers.
    if (scriptUrl.pathname.startsWith('/js/')) {
      return 'same-origin-js-script'
    }
  }

  return hasUserActivation ? null : 'no-user-activation'
}

export default function () {
  const popunderScript = useState<string>('popunder-script', () => '')
  const pushScript = useState<string>('push-notification-script', () => '')
  const isPopupGuardInstalled = useState<boolean>('ads-popup-guard-installed', () => false)
  const isPopupGuardArmed = useState<boolean>('ads-popup-guard-armed', () => false)
  const lastAdPopupAtInMemory = useState<number | null>('ads-last-popup-at-in-memory', () => null)

  if (!import.meta.client) {
    return
  }

  function isPopupGuardDebugEnabled(): boolean {
    const debugFlagOnWindow = (window as Window & Record<string, unknown>)[AD_POPUP_DEBUG_WINDOW_FLAG]

    if (typeof debugFlagOnWindow === 'boolean') {
      return debugFlagOnWindow
    }

    try {
      const rawDebugFlag = window.localStorage.getItem(AD_POPUP_DEBUG_STORAGE_KEY)

      if (!rawDebugFlag) {
        return false
      }

      return DEBUG_TRUTHY_VALUES.has(rawDebugFlag.trim().toLowerCase())
    } catch {
      return false
    }
  }

  function debugPopupGuardDecision(details: {
    decision: 'allowed' | 'blocked'
    reason: 'vendor-cap-active' | 'vendor-cap-inactive'
    vendorPopupMatchReason: VendorPopupMatchReason
    args: WindowOpenArgs
    hasUserActivation: boolean
    callerScriptUrls: URL[]
    capState: PopupCapState
    recordedPopupAt?: number
  }) {
    if (!isPopupGuardDebugEnabled()) {
      return
    }

    const [requestedUrl, target, windowFeatures] = details.args

    console.debug('[ads-popup-guard]', {
      decision: details.decision,
      reason: details.reason,
      vendorPopupMatchReason: details.vendorPopupMatchReason,
      requestedUrl: typeof requestedUrl === 'string' ? requestedUrl : null,
      target: typeof target === 'string' ? target : null,
      windowFeatures: typeof windowFeatures === 'string' ? windowFeatures : null,
      hasUserActivation: details.hasUserActivation,
      callerScriptUrlCount: details.callerScriptUrls.length,
      callerScriptUrls: details.callerScriptUrls.slice(0, 5).map(scriptUrl => scriptUrl.href),
      capDurationMs: AD_POPUP_CAP_DURATION_MS,
      capActive: details.capState.isActive,
      lastPopupAt: details.capState.lastPopupAt,
      elapsedSinceLastPopupMs: details.capState.elapsedSinceLastPopupMs,
      recordedPopupAt: details.recordedPopupAt ?? null
    })
  }

  function getLastAdPopupAt(): number | null {
    if (lastAdPopupAtInMemory.value !== null) {
      return lastAdPopupAtInMemory.value
    }

    try {
      const rawLastPopupAt = window.localStorage.getItem(AD_LAST_POPUP_AT_STORAGE_KEY)

      if (rawLastPopupAt) {
        const parsedLastPopupAt = Number.parseInt(rawLastPopupAt, 10)

        if (Number.isFinite(parsedLastPopupAt) && parsedLastPopupAt > 0) {
          lastAdPopupAtInMemory.value = parsedLastPopupAt
          return parsedLastPopupAt
        }
      }
    } catch {
      // Ignore storage failures and use in-memory fallback
    }

    return null
  }

  function recordAdPopupOpened(at = Date.now()) {
    lastAdPopupAtInMemory.value = at

    try {
      window.localStorage.setItem(AD_LAST_POPUP_AT_STORAGE_KEY, String(at))
    } catch {
      // Ignore storage failures and keep the in-memory fallback
    }
  }

  function getAdPopupCapState(now = Date.now()): PopupCapState {
    const lastAdPopupAt = getLastAdPopupAt()

    if (!lastAdPopupAt) {
      return {
        isActive: false,
        lastPopupAt: null,
        elapsedSinceLastPopupMs: null
      }
    }

    const elapsedSinceLastPopupMs = now - lastAdPopupAt

    return {
      isActive: elapsedSinceLastPopupMs < AD_POPUP_CAP_DURATION_MS,
      lastPopupAt: lastAdPopupAt,
      elapsedSinceLastPopupMs
    }
  }

  function isAdPopupCapActive(): boolean {
    return getAdPopupCapState().isActive
  }

  if (!isPopupGuardInstalled.value) {
    const originalWindowOpen = window.open.bind(window)

    window.open = (...args: WindowOpenArgs): WindowOpenResult => {
      if (!isPopupGuardArmed.value) {
        return originalWindowOpen(...args)
      }

      const userActivation = (window.navigator as Navigator & {
        // Legacy browsers may not expose navigator.userActivation.
        userActivation?: { isActive: boolean }
      }).userActivation

      // Default to true when userActivation is unavailable so older browsers keep allowing
      // popups instead of breaking ad flows entirely; this trades stricter detection for compatibility.
      const hasUserActivation = userActivation?.isActive ?? true
      const callerScriptUrls = getScriptUrlsFromStack(new Error().stack)
      const vendorPopupMatchReason = getVendorPopupMatchReason(callerScriptUrls, hasUserActivation)

      if (!vendorPopupMatchReason) {
        return originalWindowOpen(...args)
      }

      const capState = getAdPopupCapState()

      if (capState.isActive) {
        debugPopupGuardDecision({
          decision: 'blocked',
          reason: 'vendor-cap-active',
          vendorPopupMatchReason,
          args,
          hasUserActivation,
          callerScriptUrls,
          capState
        })

        return null
      }

      const openedAt = Date.now()
      recordAdPopupOpened(openedAt)

      debugPopupGuardDecision({
        decision: 'allowed',
        reason: 'vendor-cap-inactive',
        vendorPopupMatchReason,
        args,
        hasUserActivation,
        callerScriptUrls,
        capState,
        recordedPopupAt: openedAt
      })

      return originalWindowOpen(...args)
    }

    isPopupGuardInstalled.value = true
  }

  // Phase 1: stop injecting ad scripts while the 30-minute popup cap is active.
  if (isAdPopupCapActive()) {
    return
  }

  // Phase 2 (arming): once scripts load, guard vendor-like popups with the first-party cap.
  isPopupGuardArmed.value = true

  const popunderAds = [
    /**
     * ExoClick
     * Pros:
     * Cons:
     */
    // {
    //   id: '',
    //   weight: 1,
    // },
    /**
     * Adsession
     * Pros:
     * Cons:
     */
    // {
    //   id: '/js/popunder.js?v=7',
    //   weight: 1,
    // },
    /**
     * HilltopAds
     * Pros: Good min payout
     * Cons: Not fixed CPM, Low Revenue (70)
     */
    {
      id: 'https:////ellipticaltrack.com/c.D/9v6/bW2/5aleSRW/Qj9SNojrA/zWMxTuk_zvNoiJ0S2kMgDBMux_OXTCMU3Z',
      weight: 1
    },
    /**
     * Clickadu
     * Pros: Good CPM (2.1)
     * Cons: Low revenue (70), Does not count visits well, (!!!) Clears console
     */
    {
      id: '/js/popunder2.js?v=10',
      weight: 1
    }
    /**
     * AdMaven
     * Pros:
     * Cons: Does not open in a new tab, Possible malware: ads open requests to social media login??
     */
    // {
    //   id: 'https://d3pk1qkob3uzgp.cloudfront.net/?kqkpd=1171073',
    //   weight: 1,
    // },
    /**
     * AdsCarat
     * Pros: Great CPM (2.5)
     * Cons: Low Revenue (25) | Does not count visits well | Reloads website once?
     */
    // {
    //   id: 'https://hp.scrannyplacebo.com/rMGqiS1acWcIq4LyI/oQRmJ',
    //   weight: 1
    // }
  ]

  const pushAds = [
    /**
     * PartnersHouse
     * Pros:
     * Cons: Low revenue (17)
     */
    {
      id: 'https://hotbsizovu.today/process.js?id=1300335215&p1=sub1&p2=sub2&p3=sub3&p4=sub4',
      weight: 0.15
    },
    /**
     * HilltopAds
     * Pros:
     * Cons: Very Low Revenue (1.96)
     */
    // {
    //   id: '\\/\\/ellipticaltrack.com\\/b\\/XeV.sad\\/GJlb0jYvWxcR\\/HewmG9ou\\/ZWUXlukZPMTJY_yMOQTBQe5VMsjVI\\/tuNbjOIh5MNDDpkryvMSwO',
    //   weight: 0.15,
    // },
    /**
     * Clickadu
     * Pros:
     * Cons: Low Revenue (4.64)
     */
    // {
    //   id: '//guidepaparazzisurface.com/bultykh/ipp24/7/bazinga/2065744',
    //   weight: 0.15,
    // },
    /**
     * AdsCarat
     * Pros:
     * Cons: Extremely low revenue (0.50)
     */
    // {
    //   id: '//jn.astelicbanes.com/sgC9H1j3tpX/121206',
    //   weight: 0.15
    // },
    /**
     * EvaDav
     * Pros: Fixed weekly pay ()
     * Cons:
     */
    {
      id: 'https://udzpel.com/pw/waWQiOjExOTMwMzUsInNpZCI6MTQwNzY1NSwid2lkIjo2ODMzODcsInNyYyI6Mn0=eyJ.js',
      weight: 1
    }
  ]

  // Load popunder ad if not already loaded
  if (!popunderScript.value) {
    const selectedPopunder = randomWeightedChoice(popunderAds)
    popunderScript.value = selectedPopunder
  }

  // Load push notification ad if not already loaded
  if (!pushScript.value) {
    const selectedPush = randomWeightedChoice(pushAds)
    pushScript.value = selectedPush
  }

  // Load selected ads
  useHead({
    script: [
      {
        src: popunderScript.value,
        async: false,
        defer: true,

        // Fix for CORS issues - https://unhead.unjs.io/usage/composables/use-script#referrerpolicy-and-crossorigin
        crossorigin: 'anonymous'
      },
      {
        src: pushScript.value,
        async: false,
        defer: true,

        crossorigin: 'anonymous'
      }
    ]
  })
}

export function useChatWithAiReferral() {
  const chatWithAiReferrals = [
    {
      id: 'https://crushon.ai/search?s={query}&ref=zdnmmzy&mist=1',
      weight: 0.5
    },
    {
      id: 'https://spicychat.ai/?public_characters_alias%2Fsort%2Fnum_messages_24h%3Adesc[query]={query}&ref=ode2nzn',
      weight: 0.5
    }
  ]

  const chatWithAiReferralTemplate = useState<string>('chat-with-ai-referral', () => {
    return randomWeightedChoice(chatWithAiReferrals)
  })

  return {
    chatWithAiReferralTemplate
  }
}
