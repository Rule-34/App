import type { PopunderProviderMode } from '../../../composables/useAdvertisements'

export type PopunderDebugEventType =
  | 'armed'
  | 'script-loaded'
  | 'script-error'
  | 'test-click'
  | 'window-open'
  | 'location-assign'
  | 'location-replace'
  | 'anchor-blank-click'
  | 'visibilitychange'
  | 'pagehide'
  | 'beforeunload'
  | 'instrumentation-failure'
  | 'console-error'
  | 'unhandledrejection'

export type PopunderDebugEvent = {
  type: PopunderDebugEventType
  timestamp: string
  elapsedMs: number
  label?: string
  url?: string
  target?: string
  visibilityState?: string
  message?: string
  stack?: string
}

export type PopunderDebugVerdict = {
  allowedAttemptCount: number
  duplicateAttemptCount: number
  isAbusive: boolean
}

export type PopunderDebugReportInput = {
  providerMode: PopunderProviderMode
  providerLabel: string
  scriptUrl: string
  status: string
  startedAt: string
  currentUrl: string
  referrer: string
  clickCount: number
  events: readonly PopunderDebugEvent[]
}

const defaultCooldownMs = 30 * 60 * 1000
const candidateEventTypes = new Set<PopunderDebugEventType>([
  'window-open',
  'location-assign',
  'location-replace',
  'anchor-blank-click'
])

export function createPopunderDebugVerdict(events: readonly PopunderDebugEvent[], cooldownMs = defaultCooldownMs) {
  const candidates = events
    .filter((event) => candidateEventTypes.has(event.type))
    .toSorted((left, right) => left.elapsedMs - right.elapsedMs)
  const firstCandidate = candidates[0]

  if (!firstCandidate) {
    return {
      allowedAttemptCount: 0,
      duplicateAttemptCount: 0,
      isAbusive: false
    }
  }

  const duplicateAttemptCount = candidates.filter(
    (event) => event !== firstCandidate && event.elapsedMs >= firstCandidate.elapsedMs && event.elapsedMs - firstCandidate.elapsedMs <= cooldownMs
  ).length

  return {
    allowedAttemptCount: 1,
    duplicateAttemptCount,
    isAbusive: duplicateAttemptCount > 0
  }
}

export function createPopunderDebugReport(input: PopunderDebugReportInput) {
  return JSON.stringify(
    {
      ...input,
      generatedAt: new Date().toISOString(),
      verdict: createPopunderDebugVerdict(input.events)
    },
    null,
    2
  )
}
