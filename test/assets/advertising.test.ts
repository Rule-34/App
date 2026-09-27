import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  createPopunderDebugReport,
  createPopunderDebugVerdict
} from '../../app/assets/js/advertising/popunder-debug-report'
import { createPushAdDebugReport, createPushAdDebugVerdict } from '../../app/assets/js/advertising/push-ad-debug-report'
import {
  parsePopunderProviderMode,
  parsePushAdProviderMode,
  popunderProviders,
  pushAdProviders
} from '../../app/composables/useAdvertisements'

const source = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('monetization measurement', () => {
  it('tracks revenue actions without high-volume or acquisition-overwriting signals', () => {
    const promotedContent = source('app/components/pages/posts/PromotedContent.vue')
    const aiReferral = source('app/components/pages/posts/post/PostChatWithAi.vue')
    const premium = source('app/pages/premium/index.vue')
    const premiumOriginal = source('app/components/pages/premium/PremiumLandingOriginal.vue')
    const premiumOffer = source('app/components/pages/premium/PremiumOfferLanding.vue')
    const experiments = source('app/composables/useExperiments.ts')
    const matomo = source('app/plugins/040.matomo.client.ts')

    expect(source('app/assets/js/promotions.ts')).not.toContain('utm_source=internal')
    expect(promotedContent).toContain("'Promoted Content'")
    expect(promotedContent).not.toContain('sessionStorage')
    expect(promotedContent).not.toContain('vIntersectionObserver')
    expect(promotedContent).not.toContain("'Impression'")
    expect(aiReferral).not.toContain('trackEvent')
    expect(premiumOriginal).not.toContain("'Checkout Outbound'")
    expect(premiumOriginal).toContain("['trackEvent', 'Premium', 'Plan Click', interval.key]")
    expect(premiumOffer).toContain("['trackEvent', 'Premium', 'Plan Click', interval.key]")
    expect(premiumOriginal).toContain('id="pricing"')
    expect(premium).toContain('<LazyPremiumLandingOriginal')
    expect(premium).toContain('<LazyPremiumOfferLanding')
    expect(premiumOffer).toContain('checkoutPrice: 59.64')
    expect(premiumOffer).toContain('selectedPaymentInterval.checkoutPrice')
    expect(experiments).not.toContain('sessionStorage')
    expect(experiments).toContain("'original' | 'OfferFirst' | 'YearlyFocus'")
    expect(matomo).toContain("['enableLinkTracking']")
    expect(matomo.match(/\['enableLinkTracking'\]/g)).toHaveLength(1)
    expect(matomo).toContain('onNuxtReady(() =>')
    expect(matomo).toContain('trackPageView(_paq, router.currentRoute.value.fullPath, premiumLandingVariation)')
    expect(matomo).toContain("'AbTesting::create'")
    const loadAbTestingIndex = matomo.indexOf('loadAbTesting(_paq, premiumLandingVariation)')
    const trackPageViewIndex = matomo.indexOf("['trackPageView']")

    expect(loadAbTestingIndex).toBeGreaterThan(-1)
    expect(trackPageViewIndex).toBeGreaterThan(-1)
    expect(loadAbTestingIndex).toBeLessThan(trackPageViewIndex)
    expect(source('app/components/pages/home/Newsletter.vue')).not.toContain("'Newsletter', 'Submit'")
  })
})

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
    expect(
      createPopunderDebugVerdict([{ type: 'test-click', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' }])
    ).toEqual({
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

describe('popunder provider weights', () => {
  it('sums to 1.0', () => {
    const total = popunderProviders.reduce((sum, provider) => sum + provider.weight, 0)
    expect(total).toBeCloseTo(1, 5)
  })
})

describe('push ad provider weights', () => {
  it('sums to 1.0', () => {
    const total = pushAdProviders.reduce((sum, provider) => sum + provider.weight, 0)
    expect(total).toBeCloseTo(1, 5)
  })
})

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
    expect(
      createPushAdDebugVerdict([{ type: 'test-click', elapsedMs: 1000, timestamp: '2026-07-09T00:00:01.000Z' }])
    ).toEqual({
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
        {
          type: 'notification-permission-request',
          elapsedMs: 1000,
          timestamp: '2026-07-09T00:00:01.000Z',
          permission: 'default'
        }
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
        {
          type: 'dom-mutation',
          elapsedMs: 1000,
          timestamp: '2026-07-09T00:00:01.000Z',
          label: 'iframe',
          message: 'added 1 iframe'
        }
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
