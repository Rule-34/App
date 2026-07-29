import { describe, expect, it } from 'vitest'
import { getVideoAdSchedule, isEligiblePauseAd, shouldLoadVideoAds } from '../../app/assets/js/video-ad-policy'

describe('getVideoAdSchedule', () => {
  it.each([
    [1, false, false],
    [2, true, false],
    [3, false, false],
    [4, true, false],
    [5, false, false],
    [6, true, true]
  ])('preserves the existing cadence for video %i', (videoCount, pauseRoll, preRoll) => {
    expect(getVideoAdSchedule(videoCount)).toEqual({ pauseRoll, preRoll })
  })

  it('does not schedule ads before a video is counted', () => {
    expect(getVideoAdSchedule(0)).toEqual({ pauseRoll: false, preRoll: false })
  })
})

describe('shouldLoadVideoAds', () => {
  it.each([
    [false, { pauseRoll: false, preRoll: false }, false],
    [false, { pauseRoll: true, preRoll: false }, true],
    [false, { pauseRoll: false, preRoll: true }, true],
    [true, { pauseRoll: true, preRoll: true }, false]
  ])('returns %s for premium=%s and schedule=%o', (isPremium, schedule, expected) => {
    expect(shouldLoadVideoAds(isPremium, schedule)).toBe(expected)
  })
})

describe('isEligiblePauseAd', () => {
  it('allows a visible user-initiated content pause', () => {
    expect(
      isEligiblePauseAd({
        isAdActive: false,
        isContentEnded: false,
        isProgrammatic: false,
        isRequestPending: false,
        isVisible: true,
        wasShown: false
      })
    ).toBe(true)
  })

  it.each([
    ['an ad is active', { isAdActive: true }],
    ['content ended', { isContentEnded: true }],
    ['the pause is programmatic', { isProgrammatic: true }],
    ['an ad request is pending', { isRequestPending: true }],
    ['the player is offscreen', { isVisible: false }],
    ['the pause ad was already shown', { wasShown: true }]
  ])('rejects the pause when %s', (_reason, override) => {
    expect(
      isEligiblePauseAd({
        isAdActive: false,
        isContentEnded: false,
        isProgrammatic: false,
        isRequestPending: false,
        isVisible: true,
        wasShown: false,
        ...override
      })
    ).toBe(false)
  })
})
