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
  | 'focus'
  | 'blur'
  | 'pageshow'
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
  destructiveRedirectEventCount: number
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
const delayedClickWindowMs = 15 * 1000
const candidateEventTypes = new Set<PopunderDebugEventType>([
  'window-open',
  'location-assign',
  'location-replace',
  'anchor-blank-click'
])
const destructiveRedirectEventTypes = new Set<PopunderDebugEventType>(['beforeunload', 'pagehide'])

function followsRecentClick(event: PopunderDebugEvent, clicks: readonly PopunderDebugEvent[]) {
  return clicks.some(
    (click) => event.elapsedMs >= click.elapsedMs && event.elapsedMs - click.elapsedMs <= delayedClickWindowMs
  )
}

function getVisibilityCandidates(events: readonly PopunderDebugEvent[], clicks: readonly PopunderDebugEvent[]) {
  const candidates: PopunderDebugEvent[] = []
  let hiddenAfterClick = false

  for (const event of events) {
    if (event.type !== 'visibilitychange') {
      continue
    }

    if (event.visibilityState === 'hidden' && followsRecentClick(event, clicks)) {
      hiddenAfterClick = true
    } else if (event.visibilityState === 'visible' && hiddenAfterClick) {
      candidates.push(event)
      hiddenAfterClick = false
    }
  }

  return candidates
}

function hasCandidateSinceClick(
  event: PopunderDebugEvent,
  candidates: readonly PopunderDebugEvent[],
  clicks: readonly PopunderDebugEvent[]
) {
  return clicks.some(
    (click) =>
      event.elapsedMs >= click.elapsedMs &&
      event.elapsedMs - click.elapsedMs <= delayedClickWindowMs &&
      candidates.some((candidate) => candidate.elapsedMs >= click.elapsedMs && candidate.elapsedMs <= event.elapsedMs)
  )
}

function isPartOfVisibilityCandidate(
  event: PopunderDebugEvent,
  visibilityCandidates: readonly PopunderDebugEvent[],
  clicks: readonly PopunderDebugEvent[]
) {
  return clicks.some(
    (click) =>
      event.elapsedMs >= click.elapsedMs &&
      event.elapsedMs - click.elapsedMs <= delayedClickWindowMs &&
      visibilityCandidates.some(
        (candidate) =>
          candidate.elapsedMs >= event.elapsedMs && candidate.elapsedMs - click.elapsedMs <= delayedClickWindowMs
      )
  )
}

export function createPopunderDebugVerdict(events: readonly PopunderDebugEvent[], cooldownMs = defaultCooldownMs) {
  const clicks = events.filter((event) => event.type === 'test-click')
  const directCandidates = events.filter((event) => candidateEventTypes.has(event.type))
  const visibilityCandidates = getVisibilityCandidates(events, clicks)
  const candidates = [...directCandidates, ...visibilityCandidates].toSorted(
    (left, right) => left.elapsedMs - right.elapsedMs
  )
  const destructiveRedirectEventCount = events.filter(
    (event) =>
      destructiveRedirectEventTypes.has(event.type) &&
      followsRecentClick(event, clicks) &&
      !hasCandidateSinceClick(event, directCandidates, clicks) &&
      !isPartOfVisibilityCandidate(event, visibilityCandidates, clicks)
  ).length

  const firstCandidate = candidates[0]

  if (!firstCandidate) {
    return {
      allowedAttemptCount: 0,
      duplicateAttemptCount: 0,
      destructiveRedirectEventCount,
      isAbusive: destructiveRedirectEventCount > 0
    }
  }

  const duplicateAttemptCount = candidates.filter(
    (event) =>
      event !== firstCandidate &&
      event.elapsedMs >= firstCandidate.elapsedMs &&
      event.elapsedMs - firstCandidate.elapsedMs <= cooldownMs
  ).length

  return {
    allowedAttemptCount: 1,
    duplicateAttemptCount,
    destructiveRedirectEventCount,
    isAbusive: duplicateAttemptCount > 0 || destructiveRedirectEventCount > 0
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
