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
    expect(report.verdict).toEqual({ allowedAttemptCount: 1, duplicateAttemptCount: 0, isAbusive: false })
    expect(report.events).toHaveLength(1)
  })
})
