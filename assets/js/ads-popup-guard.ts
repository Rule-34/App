export const AD_POPUP_CAP_DURATION_MS = 20 * 60 * 1000
export const IN_PAGE_PUSH_SEARCH_PARAM_PREFIXES = ['inpage.'] as const

export type PopupOpenKind = 'popunder' | 'in-page-push'
export type PopupClassification = {
  kind: PopupOpenKind
  hostnames?: string[]
  searchParamPrefixes?: readonly string[]
}

export type AdPopupCapLogDetails = {
  lastPopupAt: number | null
  cappedUntil: number | null
  remainingMs: number | null
}

export type PopupGuardDecision = {
  event: 'allow-in-page-push' | 'allow-popunder' | 'block-capped-popunder'
  shouldAllow: boolean
  shouldRecordPopupAt: boolean
  capLogDetails?: AdPopupCapLogDetails
  cappedUntil?: number
}

export type TrustedPopupBypassDecision = {
  shouldBypassCurrentOpen: boolean
  nextShouldBypass: boolean
}

function hostnameMatches(hostname: string, allowedHostnames: string[]): boolean {
  return allowedHostnames.some(allowedHostname => {
    return hostname === allowedHostname || hostname.endsWith(`.${allowedHostname}`)
  })
}

function hasMatchingSearchParamPrefix(parsedUrl: URL, searchParamPrefixes: readonly string[]): boolean {
  for (const searchParamKey of parsedUrl.searchParams.keys()) {
    if (searchParamPrefixes.some(prefix => searchParamKey.startsWith(prefix))) {
      return true
    }
  }

  return false
}

function matchesPopupClassification(parsedUrl: URL, popupClassification: PopupClassification): boolean {
  if (popupClassification.hostnames && hostnameMatches(parsedUrl.hostname, popupClassification.hostnames)) {
    return true
  }

  if (popupClassification.searchParamPrefixes && hasMatchingSearchParamPrefix(parsedUrl, popupClassification.searchParamPrefixes)) {
    return true
  }

  return false
}

export function getTrustedPopupBypassDecision(shouldBypassNextWindowOpenGuard: boolean): TrustedPopupBypassDecision {
  return {
    shouldBypassCurrentOpen: shouldBypassNextWindowOpenGuard,
    nextShouldBypass: false
  }
}

export function getPopupOpenKind(
  requestedUrl: string | null,
  {
    baseUrl,
    popupClassifications
  }: {
    baseUrl: string
    popupClassifications: readonly PopupClassification[]
  }
): PopupOpenKind {
  if (!requestedUrl) {
    return 'popunder'
  }

  try {
    const parsedUrl = new URL(requestedUrl, baseUrl)

    for (const popupClassification of popupClassifications) {
      if (matchesPopupClassification(parsedUrl, popupClassification)) {
        return popupClassification.kind
      }
    }
  } catch {
    // Ignore malformed vendor URLs and keep the default popunder classification.
  }

  return 'popunder'
}

export function isAdPopupCapActive(
  lastPopupAt: number | null,
  now: number,
  capDurationMs = AD_POPUP_CAP_DURATION_MS
): boolean {
  return lastPopupAt !== null && now - lastPopupAt < capDurationMs
}

export function getAdPopupCapLogDetails(
  lastPopupAt: number | null,
  now: number,
  capDurationMs = AD_POPUP_CAP_DURATION_MS
): AdPopupCapLogDetails {
  if (lastPopupAt === null) {
    return {
      lastPopupAt: null,
      cappedUntil: null,
      remainingMs: null
    }
  }

  const cappedUntil = lastPopupAt + capDurationMs

  return {
    lastPopupAt,
    cappedUntil,
    remainingMs: Math.max(0, cappedUntil - now)
  }
}

export function getPopupGuardDecision({
  popupOpenKind,
  lastPopupAt,
  now,
  capDurationMs = AD_POPUP_CAP_DURATION_MS
}: {
  popupOpenKind: PopupOpenKind
  lastPopupAt: number | null
  now: number
  capDurationMs?: number
}): PopupGuardDecision {
  if (popupOpenKind === 'in-page-push') {
    return {
      event: 'allow-in-page-push',
      shouldAllow: true,
      shouldRecordPopupAt: false
    }
  }

  if (isAdPopupCapActive(lastPopupAt, now, capDurationMs)) {
    return {
      event: 'block-capped-popunder',
      shouldAllow: false,
      shouldRecordPopupAt: false,
      capLogDetails: getAdPopupCapLogDetails(lastPopupAt, now, capDurationMs)
    }
  }

  return {
    event: 'allow-popunder',
    shouldAllow: true,
    shouldRecordPopupAt: true,
    cappedUntil: now + capDurationMs
  }
}
