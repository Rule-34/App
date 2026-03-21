import { default as randomWeightedChoice } from 'random-weighted-choice'
import {
  AD_POPUP_CAP_DURATION_MS,
  IN_PAGE_PUSH_SEARCH_PARAM_PREFIXES,
  getAdPopupCapLogDetails as getAdPopupCapLogDetailsPure,
  getPopupGuardDecision,
  getPopupOpenKind as getPopupOpenKindPure,
  getTrustedPopupBypassDecision,
  isAdPopupCapActive as isAdPopupCapActivePure,
  type PopupClassification
} from '../assets/js/ads-popup-guard'

const AD_LAST_POPUP_AT_STORAGE_KEY = 'ads-last-popup-at'
const AD_TRUSTED_WINDOW_OPEN_BYPASS_STATE_KEY = 'ads-trusted-window-open-bypass-next'
const INTEGER_TIMESTAMP_REGEX = /^\d+$/
const AD_SCRIPT_ATTRIBUTES = {
  async: false,
  defer: true,
  crossorigin: 'anonymous' as const
}

type WindowOpenArgs = Parameters<Window['open']>
type WindowOpenResult = ReturnType<Window['open']>
type WeightedAd = {
  id: string
  weight: number
}
type AdProvider = {
  name: string
  ads: WeightedAd[]
  popupClassification?: PopupClassification
}

const POPUNDER_AD_PROVIDERS: AdProvider[] = [
  /**
   * ExoClick
   * Pros:
   * Cons:
   */
  // {
  //   name: 'ExoClick',
  //   ads: [
  //     {
  //       id: '',
  //       weight: 1
  //     }
  //   ]
  // },
  /**
   * Adsession
   * Pros:
   * Cons:
   */
  // {
  //   name: 'Adsession',
  //   ads: [
  //     {
  //       id: '/js/popunder.js?v=7',
  //       weight: 1
  //     }
  //   ]
  // },
  /**
   * HilltopAds
   * Pros: Good min payout
   * Cons: Not fixed CPM, Low Revenue (70)
   */
  {
    name: 'HilltopAds',
    ads: [
      {
        id: 'https://ellipticaltrack.com/c.D/9v6/bW2/5aleSRW/Qj9SNojrA/zWMxTuk_zvNoiJ0S2kMgDBMux_OXTCMU3Z',
        weight: 1
      }
    ]
  },
  /**
   * Clickadu
   * Pros: Good CPM (2.1)
   * Cons: Low revenue (70), Does not count visits well, (!!!) Clears console
   */
  {
    name: 'Clickadu',
    ads: [
      {
        id: '/js/popunder2.js?v=10',
        weight: 1
      }
    ]
  },
  /**
   * AdMaven
   * Pros:
   * Cons: Does not open in a new tab, Possible malware: ads open requests to social media login??
   */
  // {
  //   name: 'AdMaven',
  //   ads: [
  //     {
  //       id: 'https://d3pk1qkob3uzgp.cloudfront.net/?kqkpd=1171073',
  //       weight: 1
  //     }
  //   ]
  // },
  /**
   * AdsCarat
   * Pros: Great CPM (2.5)
   * Cons: Low Revenue (25) | Does not count visits well | Reloads website once?
   */
  // {
  //   name: 'AdsCarat',
  //   ads: [
  //     {
  //       id: 'https://hp.scrannyplacebo.com/rMGqiS1acWcIq4LyI/oQRmJ',
  //       weight: 1
  //     }
  //   ]
  // }
]

const PUSH_AD_PROVIDERS: AdProvider[] = [
  /**
   * PartnersHouse
   * Pros:
   * Cons: Low revenue (17)
   */
  {
    name: 'PartnersHouse',
    popupClassification: {
      kind: 'in-page-push',
      hostnames: ['hotbsizovu.today', 'hotsoz.com'],
      searchParamPrefixes: IN_PAGE_PUSH_SEARCH_PARAM_PREFIXES
    },
    ads: [
      {
        id: 'https://hotbsizovu.today/process.js?id=1300335215&p1=sub1&p2=sub2&p3=sub3&p4=sub4',
        weight: 0.15
      }
    ]
  },
  /**
   * HilltopAds
   * Pros:
   * Cons: Very Low Revenue (1.96)
   */
  // {
  //   name: 'HilltopAds',
  //   ads: [
  //     {
  //       id: '\\/\\/ellipticaltrack.com\\/b\\/XeV.sad\\/GJlb0jYvWxcR\\/HewmG9ou\\/ZWUXlukZPMTJY_yMOQTBQe5VMsjVI\\/tuNbjOIh5MNDDpkryvMSwO',
  //       weight: 0.15
  //     }
  //   ]
  // },
  /**
   * Clickadu
   * Pros:
   * Cons: Low Revenue (4.64)
   */
  // {
  //   name: 'Clickadu',
  //   ads: [
  //     {
  //       id: '//guidepaparazzisurface.com/bultykh/ipp24/7/bazinga/2065744',
  //       weight: 0.15
  //     }
  //   ]
  // },
  /**
   * AdsCarat
   * Pros:
   * Cons: Extremely low revenue (0.50)
   */
  // {
  //   name: 'AdsCarat',
  //   ads: [
  //     {
  //       id: '//jn.astelicbanes.com/sgC9H1j3tpX/121206',
  //       weight: 0.15
  //     }
  //   ]
  // },
  /**
   * EvaDav
   * Pros: Fixed weekly pay ()
   * Cons:
   */
  {
    name: 'EvaDav',
    popupClassification: {
      kind: 'in-page-push',
      hostnames: ['udzpel.com'],
      searchParamPrefixes: IN_PAGE_PUSH_SEARCH_PARAM_PREFIXES
    },
    ads: [
      {
        id: 'https://udzpel.com/pw/waWQiOjExOTMwMzUsInNpZCI6MTQwNzY1NSwid2lkIjo2ODMzODcsInNyYyI6Mn0=eyJ.js',
        weight: 1
      }
    ]
  }
]

function getProviderAds(providers: AdProvider[]): WeightedAd[] {
  return providers.reduce<WeightedAd[]>((ads, provider) => {
    ads.push(...provider.ads)
    return ads
  }, [])
}

function logAdPopupGuard(event: string, details?: Record<string, unknown>) {
  if (!import.meta.dev) {
    return
  }

  console.debug('[ads-popup-guard]', {
    event,
    ...details
  })
}

function getRequestedUrl(args: WindowOpenArgs): string | null {
  const [requestedUrl] = args

  return typeof requestedUrl === 'string' ? requestedUrl : null
}

const PUSH_POPUP_CLASSIFICATIONS: readonly PopupClassification[] = PUSH_AD_PROVIDERS
  .map(provider => provider.popupClassification)
  .filter((popupClassification): popupClassification is PopupClassification => Boolean(popupClassification))

export default function () {
  const popunderScript = useState<string>('popunder-script', () => '')
  const pushScript = useState<string>('push-notification-script', () => '')
  const isPopupGuardInstalled = useState<boolean>('ads-popup-guard-installed', () => false)
  const isPopupGuardArmed = useState<boolean>('ads-popup-guard-armed', () => false)
  const lastAdPopupAtInMemory = useState<number | null>('ads-last-popup-at-in-memory', () => null)
  const shouldBypassNextWindowOpenGuard = useState<boolean>(AD_TRUSTED_WINDOW_OPEN_BYPASS_STATE_KEY, () => false)

  if (!import.meta.client) {
    return
  }

  function parseStoredLastPopupAt(rawLastPopupAt: string, now: number): number | null {
    const normalizedRawLastPopupAt = rawLastPopupAt.trim()

    if (!INTEGER_TIMESTAMP_REGEX.test(normalizedRawLastPopupAt)) {
      return null
    }

    const parsedLastPopupAt = Number(normalizedRawLastPopupAt)

    if (
      !Number.isSafeInteger(parsedLastPopupAt)
      || parsedLastPopupAt <= 0
      || parsedLastPopupAt > now
    ) {
      return null
    }

    return parsedLastPopupAt
  }

  function getLastAdPopupAt(now = Date.now()): number | null {
    let resolvedLastPopupAt: number | null = null
    const inMemoryLastPopupAt = lastAdPopupAtInMemory.value

    if (inMemoryLastPopupAt !== null) {
      if (
        Number.isSafeInteger(inMemoryLastPopupAt)
        && inMemoryLastPopupAt > 0
        && inMemoryLastPopupAt <= now
      ) {
        resolvedLastPopupAt = inMemoryLastPopupAt
      } else {
        // Reset invalid or future in-memory values so they do not over-block.
        lastAdPopupAtInMemory.value = null
      }
    }

    try {
      const rawLastPopupAt = window.localStorage.getItem(AD_LAST_POPUP_AT_STORAGE_KEY)

      if (rawLastPopupAt) {
        const parsedLastPopupAt = parseStoredLastPopupAt(rawLastPopupAt, now)

        if (
          parsedLastPopupAt !== null
          && (resolvedLastPopupAt === null || parsedLastPopupAt > resolvedLastPopupAt)
        ) {
          resolvedLastPopupAt = parsedLastPopupAt
        }
      }
    } catch {
      // Ignore storage failures and use in-memory fallback
    }

    lastAdPopupAtInMemory.value = resolvedLastPopupAt

    return resolvedLastPopupAt
  }

  function recordAdPopupOpened(at = Date.now()) {
    lastAdPopupAtInMemory.value = at

    try {
      window.localStorage.setItem(AD_LAST_POPUP_AT_STORAGE_KEY, String(at))
    } catch {
      // Ignore storage failures and keep the in-memory fallback
    }
  }

  function isAdPopupCapActive(now = Date.now()): boolean {
    const lastPopupAt = getLastAdPopupAt(now)

    return isAdPopupCapActivePure(lastPopupAt, now)
  }

  function getAdPopupCapLogDetails(now = Date.now()): Record<string, number | null> {
    const lastPopupAt = getLastAdPopupAt(now)

    return getAdPopupCapLogDetailsPure(lastPopupAt, now)
  }

  if (!isPopupGuardInstalled.value) {
    const originalWindowOpen = window.open.bind(window)

    window.open = (...args: WindowOpenArgs): WindowOpenResult => {
      const requestedUrl = getRequestedUrl(args)
      const trustedPopupBypassDecision = getTrustedPopupBypassDecision(shouldBypassNextWindowOpenGuard.value)

      if (trustedPopupBypassDecision.shouldBypassCurrentOpen) {
        shouldBypassNextWindowOpenGuard.value = trustedPopupBypassDecision.nextShouldBypass

        logAdPopupGuard('trusted-open-bypass', {
          requestedUrl
        })

        return originalWindowOpen(...args)
      }

      if (!isPopupGuardArmed.value) {
        return originalWindowOpen(...args)
      }

      const popupOpenKind = getPopupOpenKindPure(requestedUrl, {
        baseUrl: window.location.href,
        popupClassifications: PUSH_POPUP_CLASSIFICATIONS
      })
      const now = Date.now()
      const popupGuardDecision = getPopupGuardDecision({
        popupOpenKind,
        lastPopupAt: popupOpenKind === 'in-page-push' ? null : getLastAdPopupAt(now),
        now
      })

      if (!popupGuardDecision.shouldAllow) {
        logAdPopupGuard(popupGuardDecision.event, {
          requestedUrl,
          ...popupGuardDecision.capLogDetails
        })

        return null
      }

      if (popupGuardDecision.shouldRecordPopupAt) {
        recordAdPopupOpened(now)
      }

      logAdPopupGuard(popupGuardDecision.event, {
        requestedUrl,
        ...(popupGuardDecision.cappedUntil ? { cappedUntil: popupGuardDecision.cappedUntil } : {})
      })

      return originalWindowOpen(...args)
    }

    isPopupGuardInstalled.value = true
  }

  // Stop injecting ad scripts while the 20-minute popup cap is active.
  if (isAdPopupCapActive()) {
    logAdPopupGuard('skip-script-injection-while-capped', {
      popunderScript: popunderScript.value || null,
      pushScript: pushScript.value || null,
      ...getAdPopupCapLogDetails()
    })

    return
  }

  // Once scripts load, guard future popunder opens with the first-party cap.
  isPopupGuardArmed.value = true

  const popunderAds = getProviderAds(POPUNDER_AD_PROVIDERS)
  const pushAds = getProviderAds(PUSH_AD_PROVIDERS)

  if (!popunderScript.value) {
    popunderScript.value = randomWeightedChoice(popunderAds)
  }

  if (!pushScript.value) {
    pushScript.value = randomWeightedChoice(pushAds)
  }

  useHead({
    script: [
      {
        src: popunderScript.value,
        ...AD_SCRIPT_ATTRIBUTES,

        // Fix for CORS issues - https://unhead.unjs.io/usage/composables/use-script#referrerpolicy-and-crossorigin
      },
      {
        src: pushScript.value,
        ...AD_SCRIPT_ATTRIBUTES
      }
    ]
  })
}

export function openTrustedWindow(...args: WindowOpenArgs): WindowOpenResult {
  if (!import.meta.client) {
    return null
  }

  const shouldBypassNextWindowOpenGuard = useState<boolean>(AD_TRUSTED_WINDOW_OPEN_BYPASS_STATE_KEY, () => false)

  shouldBypassNextWindowOpenGuard.value = true

  try {
    return window.open(...args)
  } finally {
    shouldBypassNextWindowOpenGuard.value = false
  }
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
