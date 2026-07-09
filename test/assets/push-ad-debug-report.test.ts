import { describe, expect, it } from 'vitest'
import { createPushAdDebugReport, createPushAdDebugVerdict } from '../../app/assets/js/advertising/push-ad-debug-report'
import { parsePushAdProviderMode } from '../../app/composables/useAdvertisements'

describe('push ad provider mode parsing', () => {
  it('accepts supported providers and falls back to random', () => {
    expect(parsePushAdProviderMode('evadav')).toBe('evadav')
    expect(parsePushAdProviderMode('admaven')).toBe('admaven')
    expect(parsePushAdProviderMode('adsterra')).toBe('adsterra')
    expect(parsePushAdProviderMode('random')).toBe('random')
    expect(parsePushAdProviderMode('unknown')).toBe('random')
    expect(parsePushAdProviderMode(['evadav'])).toBe('random')
  })
})

describe('createPushAdDebugVerdict', () => {
  it('returns clean verdict when no signals exist', () => {
    expect(createPushAdDebugVerdict([{ type: 'test-click', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' }])).toEqual({
      permissionPromptCount: 0,
      popupAttemptCount: 0,
      destructiveRedirectEventCount: 0,
      domMutationCount: 0,
      scriptErrorCount: 0,
      hasFill: false,
      isAbusive: false
    })
  })

  it('counts notification permission prompts as fill', () => {
    expect(
      createPushAdDebugVerdict([
        { type: 'notification-permission-request', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z', permission: 'default' }
      ])
    ).toEqual({
      permissionPromptCount: 1,
      popupAttemptCount: 0,
      destructiveRedirectEventCount: 0,
      domMutationCount: 0,
      scriptErrorCount: 0,
      hasFill: true,
      isAbusive: false
    })
  })

  it('marks page exits after clicks without popup as abusive destructive redirects', () => {
    expect(
      createPushAdDebugVerdict([
        { type: 'test-click', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' },
        { type: 'beforeunload', elapsedMs: 6000, timestamp: '2026-07-09T00:00:06.000Z' }
      ])
    ).toEqual({
      permissionPromptCount: 0,
      popupAttemptCount: 0,
      destructiveRedirectEventCount: 1,
      domMutationCount: 0,
      scriptErrorCount: 0,
      hasFill: true,
      isAbusive: true
    })
  })

  it('counts DOM mutations as in-page fill', () => {
    expect(
      createPushAdDebugVerdict([
        { type: 'dom-mutation', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z', label: 'iframe', message: 'added 1 iframe' }
      ])
    ).toEqual({
      permissionPromptCount: 0,
      popupAttemptCount: 0,
      destructiveRedirectEventCount: 0,
      domMutationCount: 1,
      scriptErrorCount: 0,
      hasFill: true,
      isAbusive: false
    })
  })
})

describe('createPushAdDebugReport', () => {
  it('returns formatted JSON with provider, script, and verdict metadata', () => {
    const report = JSON.parse(
      createPushAdDebugReport({
        providerMode: 'evadav',
        providerLabel: 'EvaDav',
        scriptUrl: 'https://example.com/push.js',
        status: 'armed',
        startedAt: '2026-07-09T00:00:00.000Z',
        currentUrl: 'https://r34.app/__ad-debug/push?provider=evadav',
        referrer: '',
        clickCount: 1,
        events: [{ type: 'script-loaded', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' }]
      })
    )

    expect(report.providerMode).toBe('evadav')
    expect(report.providerLabel).toBe('EvaDav')
    expect(report.scriptUrl).toBe('https://example.com/push.js')
    expect(report.verdict).toEqual({
      permissionPromptCount: 0,
      popupAttemptCount: 0,
      destructiveRedirectEventCount: 0,
      domMutationCount: 0,
      scriptErrorCount: 0,
      hasFill: false,
      isAbusive: false
    })
    expect(report.events).toHaveLength(1)
  })
})
