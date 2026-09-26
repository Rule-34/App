import type { PostMediaType } from './post.dto'
import { proxyUrl } from './proxy'

export const BREAKER_THRESHOLD = 3
export const BREAKER_COOLDOWN_MS = 15 * 60 * 1000 // 15 minutes

interface DomainHealthEntry {
  consecutiveFailures: number
  blockedUntil: number
  lastFailureAt?: number
}

const domainHealthMap = new Map<string, DomainHealthEntry>()

type HealthChangeListener = () => void
const healthChangeListeners = new Set<HealthChangeListener>()

/**
 * Registers a listener callback invoked when any domain health status changes.
 *
 * @param listener - Callback function invoked on domain health change.
 * @returns An unsubscribe function to remove the listener.
 */
export function onDomainHealthChange(listener: HealthChangeListener): () => void {
  healthChangeListeners.add(listener)
  return () => {
    healthChangeListeners.delete(listener)
  }
}

/**
 * Notifies all registered domain health change listeners.
 */
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
 *
 * @param url - The raw media URL string to sanitize.
 * @returns The canonical URL string, or null if the URL is empty, invalid, or non-HTTP(S).
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

    return parsed.pathname + parsed.search
  }

  const parsed = URL.parse(stripped)
  if (!parsed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) {
    return null
  }

  return parsed.href
}

export type MediaReferrerPolicy = 'origin' | 'strict-origin-when-cross-origin' | 'no-referrer'

/**
 * Determines the host-aware Referrer-Policy for media loading.
 *
 * Rules:
 * 1. e621 / e926 / e6ai CDN (static1.e621.net, etc.): requires 'origin' per e621 CDN agreement.
 * 2. First-party and internal endpoints (r34.app, akbal.dev, localhost, relative paths): 'strict-origin-when-cross-origin'.
 * 3. Third-party boorus (Danbooru, Gelbooru, Paheal, etc.) and fallback proxies (Photon, DuckDuckGo):
 *    'no-referrer' to bypass foreign referrer blocks / hotlinking 403s.
 * 4. Empty or invalid URLs: 'no-referrer'.
 */
export function getMediaReferrerPolicy(rawUrl?: string | null): MediaReferrerPolicy {
  if (!rawUrl) {
    return 'no-referrer'
  }

  const trimmed = rawUrl.trim()
  if (!trimmed) {
    return 'no-referrer'
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return 'strict-origin-when-cross-origin'
  }

  const parsed = URL.parse(trimmed)
  if (!parsed) {
    return 'no-referrer'
  }

  const hostname = parsed.hostname.toLowerCase()

  if (/(^|\.)(e621|e926|e6ai)\.net$/.test(hostname)) {
    return 'origin'
  }

  if (
    /(^|\.)(r34\.app|akbal\.dev)$/.test(hostname) ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === 'metal-mac-mini' ||
    hostname.startsWith('100.')
  ) {
    return 'strict-origin-when-cross-origin'
  }

  return 'no-referrer'
}

/**
 * Extracts a normalized domain key from a media URL and media category.
 *
 * @param rawUrl - The target media URL.
 * @param mediaType - The media type (image, video, etc.).
 * @returns A composite key of hostname and category, or null if invalid.
 */
function getDomainKey(rawUrl: string, mediaType?: PostMediaType | string): string | null {
  if (!rawUrl) return null
  const trimmed = rawUrl.trim()
  if (!trimmed) return null

  const stripped = trimmed.split('#')[0]
  if (!stripped) return null

  const parsed = URL.parse(stripped)
  if (!parsed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) {
    return null
  }

  const mediaCategory = mediaType === 'video' ? 'video' : 'image'
  return `${parsed.hostname}:${mediaCategory}`
}

/**
 * WordPress Photon CDN URL generator.
 * Converts an HTTP/S image URL into a WordPress Photon cache URL.
 * Drops non-standard ports or query parameters (as Photon does not forward them)
 * by returning the raw URL directly so it can be skipped in fallback ladders.
 *
 * @param rawUrl - The image URL to convert.
 * @returns The Photon CDN URL, or rawUrl if incompatible.
 */
export function toPhotonUrl(rawUrl: string): string {
  const url = URL.parse(rawUrl)
  if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:') || url.port || url.search) {
    return rawUrl
  }

  const hostAndPath = `${url.hostname}${url.pathname}`
  let hash = 0
  for (let i = 0; i < hostAndPath.length; i += 1) {
    hash = (hash * 31 + hostAndPath.charCodeAt(i)) & 0xffffffff
  }
  const shard = Math.abs(hash) % 4
  const sslParam = url.protocol === 'https:' ? '?ssl=1' : ''

  return `https://i${shard}.wp.com/${hostAndPath}${sslParam}`
}

const SENSITIVE_QUERY_PATTERNS = [
  /token/i,
  /auth/i,
  /sig/i,
  /key/i,
  /secret/i,
  /cred/i,
  /pass/i,
  /pwd/i,
  /^x-amz-/i,
  /^x-goog-/i,
  /bearer/i
]

/**
 * Checks whether a URL contains embedded user credentials or sensitive/signed auth tokens.
 *
 * @param rawUrl - The image URL to check.
 * @returns True if credentials or signature tokens are present.
 */
export function hasSensitiveCredentialsOrTokens(rawUrl: string): boolean {
  const url = URL.parse(rawUrl)
  if (!url) {
    return false
  }
  if (url.username || url.password) {
    return true
  }

  for (const key of url.searchParams.keys()) {
    if (SENSITIVE_QUERY_PATTERNS.some((pattern) => pattern.test(key))) {
      return true
    }
  }

  return false
}

/**
 * DuckDuckGo image proxy URL generator.
 * Skips public proxying if the URL contains embedded credentials or sensitive signed tokens.
 *
 * @param rawUrl - The image URL to convert.
 * @returns The DuckDuckGo image proxy URL, or rawUrl if invalid or credential-bearing.
 */
export function toDdgUrl(rawUrl: string): string {
  if (hasSensitiveCredentialsOrTokens(rawUrl)) {
    return rawUrl
  }

  return `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(rawUrl)}&f=1&nofb=1`
}

export interface CandidateSourceOptions {
  rawUrl: string
  mediaType: PostMediaType
  isPremium: boolean
}

/**
 * Returns an ordered array of candidate fallback URLs for a given media URL.
 *
 * @param options - Candidate source options including URL, media type, and premium status.
 * @returns An array of candidate URLs starting with the direct URL.
 */
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

  // Premium users get a dedicated media branch: proxied and automatically enhanced via imgproxy,
  // falling back to the dedicated premium backend proxy — never degraded through public third-party proxies.
  if (isPremium) {
    try {
      candidates.push(proxyUrl(cleanUrl))
    } catch {
      // Ignored if invalid
    }

    return Array.from(new Set(candidates))
  }

  if (mediaType === 'video') {
    return candidates
  }

  // Free/non-premium users: free fallback chain across public image CDNs
  const photon = toPhotonUrl(cleanUrl)
  if (photon && photon !== cleanUrl) {
    candidates.push(photon)
  }
  const ddg = toDdgUrl(cleanUrl)
  if (ddg && ddg !== cleanUrl) {
    candidates.push(ddg)
  }

  return Array.from(new Set(candidates))
}

/**
 * Checks whether direct access to the given domain and media type is currently blocked
 * by the circuit breaker.
 *
 * @param rawUrl - The target media URL.
 * @param mediaType - The media type (image, video, etc.).
 * @returns True if direct access is blocked.
 */
export function isDomainDirectBlocked(rawUrl: string, mediaType?: PostMediaType | string): boolean {
  const key = getDomainKey(rawUrl, mediaType)
  if (!key) return false

  const entry = domainHealthMap.get(key)
  if (!entry) return false

  if (entry.blockedUntil > Date.now()) {
    return true
  }

  return false
}

/**
 * Resets the circuit breaker for a domain and media type.
 *
 * @param rawUrl - The target media URL.
 * @param mediaType - The media type.
 */
export function resetDomainBreaker(rawUrl: string, mediaType?: PostMediaType | string): void {
  const key = getDomainKey(rawUrl, mediaType)
  if (!key) return

  domainHealthMap.delete(key)
  notifyHealthChange()
}

/**
 * Records a direct request failure for a domain and trips the circuit breaker
 * if the failure threshold is reached.
 *
 * @param rawUrl - The target media URL.
 * @param mediaType - The media type.
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

  // Half-open probe: if the cooldown period has elapsed, reset failure count so a single probe failure
  // does not immediately re-trip the breaker.
  if (entry.blockedUntil > 0 && now >= entry.blockedUntil) {
    entry.consecutiveFailures = 0
    entry.blockedUntil = 0
  } else if (entry.lastFailureAt && now - entry.lastFailureAt > BREAKER_COOLDOWN_MS) {
    // Stale sub-threshold failures older than the cooldown window decay to 0.
    entry.consecutiveFailures = 0
  }

  entry.consecutiveFailures += 1
  entry.lastFailureAt = now

  if (entry.consecutiveFailures >= BREAKER_THRESHOLD) {
    entry.blockedUntil = now + BREAKER_COOLDOWN_MS
  }

  domainHealthMap.set(key, entry)
  notifyHealthChange()
}

/**
 * Records a successful direct request for a domain and clears any existing failure count.
 *
 * @param rawUrl - The target media URL.
 * @param mediaType - The media type.
 */
export function recordDirectSuccess(rawUrl: string, mediaType?: PostMediaType | string): void {
  const key = getDomainKey(rawUrl, mediaType)
  if (!key) return

  const entry = domainHealthMap.get(key)
  if (entry && (entry.consecutiveFailures > 0 || entry.blockedUntil > 0 || entry.lastFailureAt !== undefined)) {
    domainHealthMap.set(key, { consecutiveFailures: 0, blockedUntil: 0 })
    notifyHealthChange()
  }
}

/**
 * Resets all domain circuit breaker state across all domains and media types.
 */
export function resetDomainHealth(): void {
  domainHealthMap.clear()
  notifyHealthChange()
}
