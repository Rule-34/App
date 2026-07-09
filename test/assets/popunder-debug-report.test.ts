import { describe, expect, it } from 'vitest'
import { createPopunderDebugReport, createPopunderDebugVerdict } from '../../app/assets/js/advertising/popunder-debug-report'
import { parsePopunderProviderMode } from '../../app/composables/useAdvertisements'

describe('popunder provider mode parsing', () => {
  it('accepts supported providers and falls back to random', () => {
    expect(parsePopunderProviderMode('hilltop')).toBe('hilltop')
    expect(parsePopunderProviderMode('clickadu')).toBe('clickadu')
    expect(parsePopunderProviderMode('profiton')).toBe('profiton')
    expect(parsePopunderProviderMode('adsterra')).toBe('adsterra')
    expect(parsePopunderProviderMode('random')).toBe('random')
    expect(parsePopunderProviderMode('unknown')).toBe('random')
    expect(parsePopunderProviderMode(['hilltop'])).toBe('random')
  })
})

describe('createPopunderDebugVerdict', () => {
  it('returns clean verdict when no candidates exist', () => {
    expect(createPopunderDebugVerdict([{ type: 'test-click', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' }])).toEqual({
      allowedAttemptCount: 0,
      duplicateAttemptCount: 0,
      destructiveRedirectEventCount: 0,
      isAbusive: false
    })
  })

  it('marks a second popunder candidate within 30 minutes as abusive', () => {
    const verdict = createPopunderDebugVerdict([
      { type: 'armed', elapsedMs: 0, timestamp: '2026-07-09T00:00:00.000Z' },
      { type: 'window-open', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z', target: '_blank' },
      { type: 'location-assign', elapsedMs: 2000, timestamp: '2026-07-09T00:00:02.000Z', url: 'https://example.com' }
    ])

    expect(verdict).toEqual({
      allowedAttemptCount: 1,
      duplicateAttemptCount: 1,
      destructiveRedirectEventCount: 0,
      isAbusive: true
    })
  })

  it('treats hidden-to-visible after clicks as mobile popunder candidates', () => {
    const verdict = createPopunderDebugVerdict([
      { type: 'test-click', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' },
      { type: 'visibilitychange', elapsedMs: 8000, timestamp: '2026-07-09T00:00:08.000Z', visibilityState: 'hidden' },
      { type: 'visibilitychange', elapsedMs: 10000, timestamp: '2026-07-09T00:00:10.000Z', visibilityState: 'visible' },
      { type: 'test-click', elapsedMs: 12000, timestamp: '2026-07-09T00:00:12.000Z' },
      { type: 'visibilitychange', elapsedMs: 18000, timestamp: '2026-07-09T00:00:18.000Z', visibilityState: 'hidden' },
      { type: 'visibilitychange', elapsedMs: 20000, timestamp: '2026-07-09T00:00:20.000Z', visibilityState: 'visible' }
    ])

    expect(verdict).toEqual({
      allowedAttemptCount: 1,
      duplicateAttemptCount: 1,
      destructiveRedirectEventCount: 0,
      isAbusive: true
    })
  })

  it('treats interrupted hidden-to-visible sequences as mobile popunder candidates', () => {
    const verdict = createPopunderDebugVerdict([
      { type: 'test-click', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' },
      { type: 'visibilitychange', elapsedMs: 8000, timestamp: '2026-07-09T00:00:08.000Z', visibilityState: 'hidden' },
      { type: 'blur', elapsedMs: 8100, timestamp: '2026-07-09T00:00:08.100Z' },
      { type: 'pagehide', elapsedMs: 8200, timestamp: '2026-07-09T00:00:08.200Z' },
      { type: 'pageshow', elapsedMs: 9500, timestamp: '2026-07-09T00:00:09.500Z' },
      { type: 'visibilitychange', elapsedMs: 10000, timestamp: '2026-07-09T00:00:10.000Z', visibilityState: 'visible' }
    ])

    expect(verdict).toEqual({
      allowedAttemptCount: 1,
      duplicateAttemptCount: 0,
      destructiveRedirectEventCount: 0,
      isAbusive: false
    })
  })

  it('marks page exits after clicks without window-open as destructive redirects', () => {
    const verdict = createPopunderDebugVerdict([
      { type: 'test-click', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' },
      { type: 'beforeunload', elapsedMs: 6000, timestamp: '2026-07-09T00:00:06.000Z' },
      { type: 'pagehide', elapsedMs: 6100, timestamp: '2026-07-09T00:00:06.100Z' }
    ])

    expect(verdict).toEqual({
      allowedAttemptCount: 0,
      duplicateAttemptCount: 0,
      destructiveRedirectEventCount: 2,
      isAbusive: true
    })
  })

  it('marks later page exits as destructive even after an earlier popunder opened', () => {
    const verdict = createPopunderDebugVerdict([
      { type: 'test-click', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' },
      { type: 'window-open', elapsedMs: 2000, timestamp: '2026-07-09T00:00:02.000Z' },
      { type: 'test-click', elapsedMs: 20000, timestamp: '2026-07-09T00:00:20.000Z' },
      { type: 'beforeunload', elapsedMs: 26000, timestamp: '2026-07-09T00:00:26.000Z' }
    ])

    expect(verdict).toEqual({
      allowedAttemptCount: 1,
      duplicateAttemptCount: 0,
      destructiveRedirectEventCount: 1,
      isAbusive: true
    })
  })

  it('counts candidates exactly 30 minutes after the first candidate as duplicates', () => {
    expect(
      createPopunderDebugVerdict([
        { type: 'window-open', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' },
        { type: 'location-replace', elapsedMs: 1000 + 30 * 60 * 1000, timestamp: '2026-07-09T00:30:01.000Z' }
      ])
    ).toEqual({
      allowedAttemptCount: 1,
      duplicateAttemptCount: 1,
      destructiveRedirectEventCount: 0,
      isAbusive: true
    })
  })

  it('ignores a second candidate after the cooldown window', () => {
    const verdict = createPopunderDebugVerdict([
      { type: 'window-open', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' },
      { type: 'location-replace', elapsedMs: 1000 + 31 * 60 * 1000, timestamp: '2026-07-09T00:31:01.000Z' }
    ])

    expect(verdict).toEqual({
      allowedAttemptCount: 1,
      duplicateAttemptCount: 0,
      destructiveRedirectEventCount: 0,
      isAbusive: false
    })
  })

  it('sorts out-of-order candidates before applying the cooldown window', () => {
    expect(
      createPopunderDebugVerdict([
        { type: 'location-replace', elapsedMs: 2000, timestamp: '2026-07-09T00:00:02.000Z' },
        { type: 'window-open', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' }
      ])
    ).toEqual({
      allowedAttemptCount: 1,
      duplicateAttemptCount: 1,
      destructiveRedirectEventCount: 0,
      isAbusive: true
    })
  })

  it('counts every duplicate candidate inside the cooldown window', () => {
    expect(
      createPopunderDebugVerdict([
        { type: 'window-open', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' },
        { type: 'location-assign', elapsedMs: 2000, timestamp: '2026-07-09T00:00:02.000Z' },
        { type: 'anchor-blank-click', elapsedMs: 3000, timestamp: '2026-07-09T00:00:03.000Z' }
      ])
    ).toEqual({
      allowedAttemptCount: 1,
      duplicateAttemptCount: 2,
      destructiveRedirectEventCount: 0,
      isAbusive: true
    })
  })
})

describe('createPopunderDebugReport', () => {
  it('returns formatted JSON with provider, script, and verdict metadata', () => {
    const report = JSON.parse(
      createPopunderDebugReport({
        providerMode: 'hilltop',
        providerLabel: 'HilltopAds',
        scriptUrl: 'https://example.com/pop.js',
        status: 'armed',
        startedAt: '2026-07-09T00:00:00.000Z',
        currentUrl: 'https://r34.app/__ad-debug/popunder?provider=hilltop',
        referrer: '',
        clickCount: 2,
        events: [{ type: 'window-open', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' }]
      })
    )

    expect(report.providerMode).toBe('hilltop')
    expect(report.providerLabel).toBe('HilltopAds')
    expect(report.scriptUrl).toBe('https://example.com/pop.js')
    expect(report.verdict).toEqual({
      allowedAttemptCount: 1,
      duplicateAttemptCount: 0,
      destructiveRedirectEventCount: 0,
      isAbusive: false
    })
    expect(report.events).toHaveLength(1)
  })
})
