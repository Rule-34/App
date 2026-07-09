import type { PushAdProviderMode } from '../../../composables/useAdvertisements'

export type PushAdDebugEventType =
  | 'armed'
  | 'script-loaded'
  | 'script-error'
  | 'test-click'
  | 'notification-permission-request'
  | 'notification-permission-result'
  | 'window-open'
  | 'visibilitychange'
  | 'focus'
  | 'blur'
  | 'pageshow'
  | 'pagehide'
  | 'beforeunload'
  | 'dom-mutation'
  | 'instrumentation-failure'
  | 'console-error'
  | 'unhandledrejection'

export type PushAdDebugEvent = {
  type: PushAdDebugEventType
  timestamp: string
  elapsedMs: number
  label?: string
  url?: string
  target?: string
  visibilityState?: string
  permission?: NotificationPermission | 'unsupported'
  message?: string
  stack?: string
}

export type PushAdDebugVerdict = {
  permissionPromptCount: number
  popupAttemptCount: number
  destructiveRedirectEventCount: number
  domMutationCount: number
  scriptErrorCount: number
  hasFill: boolean
  isAbusive: boolean
}

export type PushAdDebugReportInput = {
  providerMode: PushAdProviderMode
  providerLabel: string
  scriptUrl: string
  status: string
  startedAt: string
  currentUrl: string
  referrer: string
  clickCount: number
  events: readonly PushAdDebugEvent[]
}

const delayedClickWindowMs = 15 * 1000

function followsRecentClick(event: PushAdDebugEvent, clicks: readonly PushAdDebugEvent[]) {
  return clicks.some((click) => event.elapsedMs >= click.elapsedMs && event.elapsedMs - click.elapsedMs <= delayedClickWindowMs)
}

export function createPushAdDebugVerdict(events: readonly PushAdDebugEvent[]): PushAdDebugVerdict {
  const clicks = events.filter((event) => event.type === 'test-click')
  const permissionPromptCount = events.filter((event) => event.type === 'notification-permission-request').length
  const popupAttemptCount = events.filter((event) => event.type === 'window-open').length
  const destructiveRedirectEventCount = events.filter(
    (event) => (event.type === 'beforeunload' || event.type === 'pagehide') && followsRecentClick(event, clicks) && popupAttemptCount === 0
  ).length
  const domMutationCount = events.filter((event) => event.type === 'dom-mutation').length
  const scriptErrorCount = events.filter((event) => event.type === 'script-error' || event.type === 'console-error' || event.type === 'unhandledrejection').length

  return {
    permissionPromptCount,
    popupAttemptCount,
    destructiveRedirectEventCount,
    domMutationCount,
    scriptErrorCount,
    hasFill: permissionPromptCount > 0 || popupAttemptCount > 0 || destructiveRedirectEventCount > 0 || domMutationCount > 0,
    isAbusive: destructiveRedirectEventCount > 0
  }
}

export function createPushAdDebugReport(input: PushAdDebugReportInput) {
  return JSON.stringify(
    {
      ...input,
      generatedAt: new Date().toISOString(),
      verdict: createPushAdDebugVerdict(input.events)
    },
    null,
    2
  )
}
