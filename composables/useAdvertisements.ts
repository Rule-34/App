import { default as randomWeightedChoice } from 'random-weighted-choice'

const AD_POPUP_CAP_DURATION_MS = 30 * 60 * 1000
const AD_LAST_POPUP_AT_STORAGE_KEY = 'ads-last-popup-at'
const STACK_URL_REGEX = /https?:\/\/[^\s)]+/g

type WindowOpenArgs = Parameters<Window['open']>
type WindowOpenResult = ReturnType<Window['open']>

function getScriptUrlsFromStack(stack: string): URL[] {
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

function isLikelyVendorPopupCall(stack: string | undefined, hasUserActivation: boolean): boolean {
  if (!stack) {
    return !hasUserActivation
  }

  const callerScriptUrls = getScriptUrlsFromStack(stack)

  if (callerScriptUrls.length === 0) {
    return !hasUserActivation
  }

  const currentOrigin = window.location.origin

  for (const scriptUrl of callerScriptUrls) {
    if (scriptUrl.origin !== currentOrigin) {
      return true
    }

    // Keep the heuristic broad: treat same-origin static /js scripts as likely ad/vendor callers.
    if (scriptUrl.pathname.startsWith('/js/')) {
      return true
    }
  }

  return !hasUserActivation
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

  function isAdPopupCapActive(): boolean {
    const lastAdPopupAt = getLastAdPopupAt()

    if (!lastAdPopupAt) {
      return false
    }

    return Date.now() - lastAdPopupAt < AD_POPUP_CAP_DURATION_MS
  }

  if (!isPopupGuardInstalled.value) {
    const originalWindowOpen = window.open.bind(window)

    window.open = (...args: WindowOpenArgs): WindowOpenResult => {
      if (!isPopupGuardArmed.value) {
        return originalWindowOpen(...args)
      }

      const userActivation = (window.navigator as Navigator & {
        userActivation?: { isActive: boolean }
      }).userActivation

      const hasUserActivation = userActivation?.isActive ?? true
      const stack = new Error().stack

      if (!isLikelyVendorPopupCall(stack, hasUserActivation)) {
        return originalWindowOpen(...args)
      }

      if (isAdPopupCapActive()) {
        return null
      }

      recordAdPopupOpened()

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
