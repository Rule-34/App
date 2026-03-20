import { default as randomWeightedChoice } from 'random-weighted-choice'

const AD_POPUP_CAP_DURATION_MS = 30 * 60 * 1000
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
type PopupOpenKind = 'popunder' | 'in-page-push'
type WeightedAd = {
  id: string
  weight: number
}
type PushAd = WeightedAd & {
  inPageOpenHostnames: string[]
}

const POPUNDER_ADS: WeightedAd[] = [
  {
    id: 'https:////ellipticaltrack.com/c.D/9v6/bW2/5aleSRW/Qj9SNojrA/zWMxTuk_zvNoiJ0S2kMgDBMux_OXTCMU3Z',
    weight: 1
  },
  {
    id: '/js/popunder2.js?v=10',
    weight: 1
  }
]

const PUSH_ADS: PushAd[] = [
  {
    id: 'https://hotbsizovu.today/process.js?id=1300335215&p1=sub1&p2=sub2&p3=sub3&p4=sub4',
    weight: 0.15,
    inPageOpenHostnames: ['hotbsizovu.today']
  },
  {
    id: 'https://udzpel.com/pw/waWQiOjExOTMwMzUsInNpZCI6MTQwNzY1NSwid2lkIjo2ODMzODcsInNyYyI6Mn0=eyJ.js',
    weight: 1,
    inPageOpenHostnames: ['udzpel.com', 'hotsoz.com']
  }
]

const CHAT_WITH_AI_REFERRALS: WeightedAd[] = [
  {
    id: 'https://crushon.ai/search?s={query}&ref=zdnmmzy&mist=1',
    weight: 0.5
  },
  {
    id: 'https://spicychat.ai/?public_characters_alias%2Fsort%2Fnum_messages_24h%3Adesc[query]={query}&ref=ode2nzn',
    weight: 0.5
  }
]

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

function hostnameMatches(hostname: string, allowedHostnames: string[]): boolean {
  return allowedHostnames.some(allowedHostname => {
    return hostname === allowedHostname || hostname.endsWith(`.${allowedHostname}`)
  })
}

function findPushAdByScriptId(scriptId: string): PushAd | null {
  return PUSH_ADS.find(pushAd => pushAd.id === scriptId) ?? null
}

function getPopupOpenKind(args: WindowOpenArgs, activePushAd: PushAd | null): PopupOpenKind {
  const requestedUrl = getRequestedUrl(args)

  if (!requestedUrl) {
    return 'popunder'
  }

  try {
    const parsedUrl = new URL(requestedUrl, window.location.href)

    if (activePushAd && hostnameMatches(parsedUrl.hostname, activePushAd.inPageOpenHostnames)) {
      return 'in-page-push'
    }

    for (const searchParamKey of parsedUrl.searchParams.keys()) {
      if (searchParamKey.startsWith('inpage.')) {
        return 'in-page-push'
      }
    }
  } catch {
    // Ignore malformed vendor URLs and keep the default popunder classification.
  }

  return 'popunder'
}

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
      // Ignore storage failures and use in-memory fallback.
    }

    lastAdPopupAtInMemory.value = resolvedLastPopupAt

    return resolvedLastPopupAt
  }

  function recordAdPopupOpened(at = Date.now()) {
    lastAdPopupAtInMemory.value = at

    try {
      window.localStorage.setItem(AD_LAST_POPUP_AT_STORAGE_KEY, String(at))
    } catch {
      // Ignore storage failures and keep the in-memory fallback.
    }
  }

  function isAdPopupCapActive(now = Date.now()): boolean {
    const lastPopupAt = getLastAdPopupAt(now)

    return lastPopupAt !== null && now - lastPopupAt < AD_POPUP_CAP_DURATION_MS
  }

  function getAdPopupCapLogDetails(now = Date.now()): Record<string, number | null> {
    const lastPopupAt = getLastAdPopupAt(now)

    if (lastPopupAt === null) {
      return {
        lastPopupAt: null,
        cappedUntil: null,
        remainingMs: null
      }
    }

    const cappedUntil = lastPopupAt + AD_POPUP_CAP_DURATION_MS

    return {
      lastPopupAt,
      cappedUntil,
      remainingMs: Math.max(0, cappedUntil - now)
    }
  }

  if (!isPopupGuardInstalled.value) {
    const originalWindowOpen = window.open.bind(window)

    window.open = (...args: WindowOpenArgs): WindowOpenResult => {
      const activePushAd = findPushAdByScriptId(pushScript.value)

      if (shouldBypassNextWindowOpenGuard.value) {
        shouldBypassNextWindowOpenGuard.value = false

        logAdPopupGuard('trusted-open-bypass', {
          requestedUrl: getRequestedUrl(args)
        })

        return originalWindowOpen(...args)
      }

      if (!isPopupGuardArmed.value) {
        return originalWindowOpen(...args)
      }

      if (getPopupOpenKind(args, activePushAd) === 'in-page-push') {
        logAdPopupGuard('allow-in-page-push', {
          requestedUrl: getRequestedUrl(args)
        })

        return originalWindowOpen(...args)
      }

      if (isAdPopupCapActive()) {
        logAdPopupGuard('block-capped-popunder', {
          requestedUrl: getRequestedUrl(args),
          ...getAdPopupCapLogDetails()
        })

        return null
      }

      recordAdPopupOpened()

      logAdPopupGuard('allow-popunder', {
        requestedUrl: getRequestedUrl(args),
        cappedUntil: Date.now() + AD_POPUP_CAP_DURATION_MS
      })

      return originalWindowOpen(...args)
    }

    isPopupGuardInstalled.value = true
  }

  if (isAdPopupCapActive()) {
    logAdPopupGuard('skip-script-injection-while-capped', {
      popunderScript: popunderScript.value || null,
      pushScript: pushScript.value || null,
      ...getAdPopupCapLogDetails()
    })

    return
  }

  isPopupGuardArmed.value = true

  if (!popunderScript.value) {
    popunderScript.value = randomWeightedChoice(POPUNDER_ADS)
  }

  if (!pushScript.value) {
    pushScript.value = randomWeightedChoice(PUSH_ADS)
  }

  useHead({
    script: [
      {
        src: popunderScript.value,
        ...AD_SCRIPT_ATTRIBUTES
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
  const chatWithAiReferralTemplate = useState<string>('chat-with-ai-referral', () => {
    return randomWeightedChoice(CHAT_WITH_AI_REFERRALS)
  })

  return {
    chatWithAiReferralTemplate
  }
}
