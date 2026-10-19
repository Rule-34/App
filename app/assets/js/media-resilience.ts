import type { PostMediaType } from './post.dto'
import { proxyUrl } from './proxy'

const BREAKER_THRESHOLD = 3
export const BREAKER_COOLDOWN_MS = 15 * 60 * 1000 // 15 minutes

interface DomainHealthEntry {
  consecutiveFailures: number
  blockedUntil: number
  lastFailureAt?: number
}

const domainHealthMap = new Map<string, DomainHealthEntry>()

type HealthChangeListener = () => void
const healthChangeListeners = new Set<HealthChangeListener>()

export function onDomainHealthChange(listener: HealthChangeListener): () => void {
  healthChangeListeners.add(listener)
  return () => {
    healthChangeListeners.delete(listener)
  }
}

function notifyHealthChange(): void {
  for (const listener of healthChangeListeners) {
    try {
      listener()
    } catch {
      // Ignored
    }
  }
}

/**
 * Sanitizes and validates a media URL.
 * Trims whitespace, strips URI fragment identifiers (#...), ensures the URL can be parsed,
 * and strictly restricts protocols to http: or https: to guard against malicious/bogus URI schemes.
 */
export function cleanMediaUrl(url?: string | null): string | null {
  if (!url) {
    return null
  }

  const trimmed = url.trim()
  if (!trimmed) {
    return null
  }

  const stripped = trimmed.split('#')[0]
  if (!stripped) {
    return null
  }

  if (stripped.startsWith('/') && !stripped.startsWith('//')) {
    const parsed = URL.parse(stripped, 'http://localhost')
    if (!parsed || parsed.origin !== 'http://localhost') {
      return null
    }

    return parsed.pathname.replace(/%20/gi, ' ') + parsed.search
  }

  const parsed = URL.parse(stripped)
  if (!parsed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) {
    return null
  }

  return parsed.href
}

/** Hosts that get the `origin` referrer by agreement; the page-level policy and per-media policy both read this. */
export const ORIGIN_REFERRER_DOMAINS = ['e621.net']

export type MediaReferrerPolicy = 'origin' | 'strict-origin-when-cross-origin' | 'no-referrer'

/**
 * Determines the host-aware Referrer-Policy for media loading.
 *
 * Rules:
 * 1. Hosts in ORIGIN_REFERRER_DOMAINS (and their subdomains): 'origin', by agreement.
 * 2. Relative paths and first-party hosts (the caller supplies them, see `useFirstPartyHosts`):
 *    'strict-origin-when-cross-origin'.
 * 3. Third-party boorus (Danbooru, Gelbooru, Paheal, etc.) and fallback proxies (Photon, DuckDuckGo):
 *    'no-referrer' to bypass foreign referrer blocks / hotlinking 403s.
 * 4. Empty or invalid URLs: 'no-referrer'.
 */
export function getMediaReferrerPolicy(
  rawUrl?: string | null,
  firstPartyHosts: readonly string[] = []
): MediaReferrerPolicy {
  if (!rawUrl) {
    return 'no-referrer'
  }

  const trimmed = rawUrl.trim()
  if (!trimmed) {
    return 'no-referrer'
  }

  // Protocol-relative (//host) URLs are cross-origin, so they must not take the first-party branch
  if ((trimmed.startsWith('/') && !trimmed.startsWith('//')) || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return 'strict-origin-when-cross-origin'
  }

  const parsed = URL.parse(trimmed)
  if (!parsed) {
    return 'no-referrer'
  }

  const hostname = parsed.hostname.toLowerCase()

  if (ORIGIN_REFERRER_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
    return 'origin'
  }

  if (firstPartyHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
    return 'strict-origin-when-cross-origin'
  }

  return 'no-referrer'
}

function getDomainKey(rawUrl: string, mediaType?: PostMediaType | string): string | null {
  const clean = cleanMediaUrl(rawUrl)
  const parsed = clean ? URL.parse(clean) : null
  if (!parsed) return null

  const mediaCategory = mediaType === 'video' ? 'video' : 'image'
  return `${parsed.hostname}:${mediaCategory}`
}

/**
 * Converts an HTTP/S image URL into a WordPress Photon cache URL (one host, so HTTP/2 reuses a single connection).
 * Drops non-standard ports or query parameters (as Photon does not forward them)
 * by returning the raw URL directly so it can be skipped in fallback ladders.
 */
export function toPhotonUrl(rawUrl: string): string {
  const url = URL.parse(rawUrl)
  if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:') || url.port || url.search) {
    return rawUrl
  }

  const sslParam = url.protocol === 'https:' ? '?ssl=1' : ''

  return `https://i0.wp.com/${url.hostname}${url.pathname}${sslParam}`
}

export function toDdgUrl(rawUrl: string): string {
  return `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(rawUrl)}&f=1&nofb=1`
}

interface CandidateSourceOptions {
  rawUrl: string
  mediaType: PostMediaType
  isPremium: boolean
}

export function getCandidateSources(options: CandidateSourceOptions): string[] {
  const { rawUrl, mediaType, isPremium } = options
  const cleanUrl = cleanMediaUrl(rawUrl)
  if (!cleanUrl) return []

  const candidates: string[] = [cleanUrl]

  // Relative/local assets (/img/...) are served directly by the local app server;
  // do not proxy them through imgproxy or third-party image CDNs (Photon, DuckDuckGo).
  if (cleanUrl.startsWith('/')) {
    return candidates
  }

  // Public image CDNs; they cannot proxy video
  if (mediaType !== 'video') {
    const photon = toPhotonUrl(cleanUrl)
    if (photon !== cleanUrl) {
      candidates.push(photon)
    }

    candidates.push(toDdgUrl(cleanUrl))
  }

  // Our own proxy is the last resort for premium
  if (isPremium) {
    candidates.push(proxyUrl(cleanUrl))
  }

  return candidates
}

export function isDomainDirectBlocked(rawUrl: string, mediaType?: PostMediaType | string): boolean {
  const key = getDomainKey(rawUrl, mediaType)
  if (!key) return false

  return (domainHealthMap.get(key)?.blockedUntil ?? 0) > Date.now()
}

export function resetDomainBreaker(rawUrl: string, mediaType?: PostMediaType | string): void {
  const key = getDomainKey(rawUrl, mediaType)
  if (!key) return

  domainHealthMap.delete(key)
  notifyHealthChange()
}

/**
 * Records a direct request failure for a domain and trips the circuit breaker
 * if the failure threshold is reached.
 */
export function recordDirectFailure(rawUrl: string, mediaType?: PostMediaType | string): void {
  const key = getDomainKey(rawUrl, mediaType)
  if (!key) return

  const now = Date.now()
  const entry = domainHealthMap.get(key) ?? { consecutiveFailures: 0, blockedUntil: 0 }

  // If already blocked and still within cooldown, ignore trailing failures so the cooldown isn't extended indefinitely.
  if (entry.blockedUntil > 0 && now < entry.blockedUntil) {
    return
  }

  // Half-open probe (cooldown elapsed) or stale sub-threshold failures older than the cooldown window:
  // reset the count so a single failure does not immediately re-trip the breaker.
  if (entry.blockedUntil > 0 || (entry.lastFailureAt && now - entry.lastFailureAt > BREAKER_COOLDOWN_MS)) {
    entry.consecutiveFailures = 0
    entry.blockedUntil = 0
  }

  entry.consecutiveFailures += 1
  entry.lastFailureAt = now

  if (entry.consecutiveFailures >= BREAKER_THRESHOLD) {
    entry.blockedUntil = now + BREAKER_COOLDOWN_MS
  }

  domainHealthMap.set(key, entry)
  notifyHealthChange()
}

export function recordDirectSuccess(rawUrl: string, mediaType?: PostMediaType | string): void {
  const key = getDomainKey(rawUrl, mediaType)
  if (!key) return

  if (domainHealthMap.has(key)) {
    domainHealthMap.delete(key)
    notifyHealthChange()
  }
}

export function resetDomainHealth(): void {
  domainHealthMap.clear()
  notifyHealthChange()
}
