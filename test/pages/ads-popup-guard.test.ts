import { describe, expect, it } from 'vitest'
import {
  AD_POPUP_CAP_DURATION_MS,
  getAdPopupCapLogDetails,
  getPopupGuardDecision,
  getPopupOpenKind,
  getTrustedPopupBypassDecision,
  IN_PAGE_PUSH_SEARCH_PARAM_PREFIXES
} from '../../assets/js/ads-popup-guard'

const PUSH_POPUP_CLASSIFICATIONS = [
  {
    kind: 'in-page-push' as const,
    hostnames: ['hotbsizovu.today', 'hotsoz.com'],
    searchParamPrefixes: IN_PAGE_PUSH_SEARCH_PARAM_PREFIXES
  },
  {
    kind: 'in-page-push' as const,
    hostnames: ['udzpel.com'],
    searchParamPrefixes: IN_PAGE_PUSH_SEARCH_PARAM_PREFIXES
  }
]

describe('popup guard', () => {
  it('allows the first popunder attempt and records the cap decision path', () => {
    const now = 1_710_000_000_000
    const popupOpenKind = getPopupOpenKind('https://bundlemoviepumice.com/test', {
      baseUrl: 'https://r34.app/',
      popupClassifications: PUSH_POPUP_CLASSIFICATIONS
    })

    const decision = getPopupGuardDecision({
      popupOpenKind,
      lastPopupAt: null,
      now
    })

    expect(decision).toEqual({
      event: 'allow-popunder',
      shouldAllow: true,
      shouldRecordPopupAt: true,
      cappedUntil: now + AD_POPUP_CAP_DURATION_MS
    })
  })

  it('blocks a second popunder attempt within 20 minutes', () => {
    const now = 1_710_000_000_000
    const fiveMinutesAgo = now - (5 * 60 * 1000)

    const decision = getPopupGuardDecision({
      popupOpenKind: 'popunder',
      lastPopupAt: fiveMinutesAgo,
      now
    })

    expect(decision.event).toBe('block-capped-popunder')
    expect(decision.shouldAllow).toBe(false)
    expect(decision.shouldRecordPopupAt).toBe(false)
    expect(decision.capLogDetails).toEqual({
      lastPopupAt: fiveMinutesAgo,
      cappedUntil: fiveMinutesAgo + AD_POPUP_CAP_DURATION_MS,
      remainingMs: AD_POPUP_CAP_DURATION_MS - (5 * 60 * 1000)
    })
  })

  it('treats push provider URLs as in-page-push and exempts them from cap recording', () => {
    const now = 1_710_000_000_000
    const popupOpenKind = getPopupOpenKind('https://hotsoz.com/wnclcm?inpage.campaign=foo', {
      baseUrl: 'https://r34.app/',
      popupClassifications: PUSH_POPUP_CLASSIFICATIONS
    })

    const decision = getPopupGuardDecision({
      popupOpenKind,
      lastPopupAt: now - 60_000,
      now
    })

    expect(popupOpenKind).toBe('in-page-push')
    expect(decision).toEqual({
      event: 'allow-in-page-push',
      shouldAllow: true,
      shouldRecordPopupAt: false
    })
  })

  it('returns trusted bypass decision path for guarded window.open', () => {
    expect(getTrustedPopupBypassDecision(true)).toEqual({
      shouldBypassCurrentOpen: true,
      nextShouldBypass: false
    })

    expect(getTrustedPopupBypassDecision(false)).toEqual({
      shouldBypassCurrentOpen: false,
      nextShouldBypass: false
    })
  })

  it('allows popunder after cap expires at 20 minutes', () => {
    const now = 1_710_000_000_000
    const expiredLastPopupAt = now - AD_POPUP_CAP_DURATION_MS - 1

    const decision = getPopupGuardDecision({
      popupOpenKind: 'popunder',
      lastPopupAt: expiredLastPopupAt,
      now
    })

    expect(decision).toEqual({
      event: 'allow-popunder',
      shouldAllow: true,
      shouldRecordPopupAt: true,
      cappedUntil: now + AD_POPUP_CAP_DURATION_MS
    })

    expect(getAdPopupCapLogDetails(expiredLastPopupAt, now)).toEqual({
      lastPopupAt: expiredLastPopupAt,
      cappedUntil: expiredLastPopupAt + AD_POPUP_CAP_DURATION_MS,
      remainingMs: 0
    })
  })

  it('classifies provider URL as in-page-push by hostname or param prefix', () => {
    const byHostname = getPopupOpenKind('https://hotbsizovu.today/process.js?id=1', {
      baseUrl: 'https://r34.app/',
      popupClassifications: PUSH_POPUP_CLASSIFICATIONS
    })
    const byQueryParamPrefix = getPopupOpenKind('https://unknown.example/path?inpage.foo=bar', {
      baseUrl: 'https://r34.app/',
      popupClassifications: PUSH_POPUP_CLASSIFICATIONS
    })

    expect(byHostname).toBe('in-page-push')
    expect(byQueryParamPrefix).toBe('in-page-push')
  })
})
