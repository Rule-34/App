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
 * Extracts a normalized domain key from a media URL and media category.
 *
 * @param rawUrl - The target media URL.
 * @param mediaType - The media type (image, video, etc.).
 * @returns A composite key of hostname and category, or null if invalid.
 */
function getDomainKey(rawUrl: string, mediaType?: PostMediaType | string): string | null {
  try {
    const parsed = new URL(rawUrl)
    const mediaCategory = mediaType === 'video' ? 'video' : 'image'
    return `${parsed.hostname}:${mediaCategory}`
  } catch {
    return null
  }
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
  try {
    const url = new URL(rawUrl)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return rawUrl
    }
    // Photon drops non-standard ports and does not forward origin query parameters.
    // If rawUrl has a port or query string, return rawUrl so it is skipped.
    if (url.port || url.search) {
      return rawUrl
    }

    const hostAndPath = `${url.hostname}${url.pathname}`
    const params = new URLSearchParams()

    if (url.protocol === 'https:') {
      params.set('ssl', '1')
    }

    let hash = 0
    for (let i = 0; i < hostAndPath.length; i += 1) {
      hash = (hash * 31 + hostAndPath.charCodeAt(i)) & 0xffffffff
    }
    const shard = Math.abs(hash) % 4

    const query = params.toString()
    return `https://i${shard}.wp.com/${hostAndPath}${query ? `?${query}` : ''}`
  } catch {
    return rawUrl
  }
}

/**
 * DuckDuckGo image proxy URL generator.
 *
 * @param rawUrl - The image URL to convert.
 * @returns The DuckDuckGo image proxy URL, or rawUrl if invalid.
 */
export function toDdgUrl(rawUrl: string): string {
  try {
    const params = new URLSearchParams({
      u: rawUrl,
      f: '1',
      nofb: '1'
    })
    return `https://external-content.duckduckgo.com/iu/?${params.toString()}`
  } catch {
    return rawUrl
  }
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
  if (!rawUrl) return []

  const candidates: string[] = [rawUrl]

  if (mediaType === 'video') {
    if (isPremium) {
      try {
        candidates.push(proxyUrl(rawUrl))
      } catch {
        // Ignored if invalid
      }
    }

    return Array.from(new Set(candidates))
  }

  // Images, animated GIFs, and video poster images
  const photon = toPhotonUrl(rawUrl)
  if (photon && photon !== rawUrl) {
    candidates.push(photon)
  }
  const ddg = toDdgUrl(rawUrl)
  if (ddg && ddg !== rawUrl) {
    candidates.push(ddg)
  }

  if (isPremium) {
    try {
      candidates.push(proxyUrl(rawUrl))
    } catch {
      // Ignored if invalid
    }
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
