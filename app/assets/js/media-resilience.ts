import type { PostMediaType } from './post.dto'
import { proxyUrl } from './proxy'

const BREAKER_THRESHOLD = 3
const BREAKER_COOLDOWN_MS = 15 * 60 * 1000 // 15 minutes

interface DomainHealthEntry {
  consecutiveFailures: number
  blockedUntil: number
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

function getDomainKey(rawUrl: string, mediaType?: PostMediaType | string): string | null {
  try {
    const parsed = new URL(rawUrl)
    const mediaCategory = mediaType === 'video' ? 'video' : 'image'
    return `${parsed.hostname}:${mediaCategory}`
  } catch {
    return null
  }
}

export function toPhotonUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)
    const hostAndPath = `${url.hostname}${url.pathname}`
    const params = new URLSearchParams(url.search)

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
  candidates.push(toPhotonUrl(rawUrl))
  candidates.push(toDdgUrl(rawUrl))

  if (isPremium) {
    try {
      candidates.push(proxyUrl(rawUrl))
    } catch {
      // Ignored if invalid
    }
  }

  return Array.from(new Set(candidates))
}

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

export function resetDomainBreaker(rawUrl: string, mediaType?: PostMediaType | string): void {
  const key = getDomainKey(rawUrl, mediaType)
  if (!key) return

  domainHealthMap.delete(key)
  notifyHealthChange()
}

export function recordDirectFailure(rawUrl: string, mediaType?: PostMediaType | string): void {
  const key = getDomainKey(rawUrl, mediaType)
  if (!key) return

  const entry = domainHealthMap.get(key) ?? { consecutiveFailures: 0, blockedUntil: 0 }
  entry.consecutiveFailures += 1

  if (entry.consecutiveFailures >= BREAKER_THRESHOLD) {
    entry.blockedUntil = Date.now() + BREAKER_COOLDOWN_MS
  }

  domainHealthMap.set(key, entry)
  notifyHealthChange()
}

export function recordDirectSuccess(rawUrl: string, mediaType?: PostMediaType | string): void {
  const key = getDomainKey(rawUrl, mediaType)
  if (!key) return

  const entry = domainHealthMap.get(key)
  if (entry && (entry.consecutiveFailures > 0 || entry.blockedUntil > 0)) {
    domainHealthMap.set(key, { consecutiveFailures: 0, blockedUntil: 0 })
    notifyHealthChange()
  }
}

export function resetDomainHealth(): void {
  domainHealthMap.clear()
  notifyHealthChange()
}
