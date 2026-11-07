import { describe, expect, it } from 'vitest'
import {
  canonicalPremiumLandingVariation,
  isPremiumLandingPath,
  isPremiumRoute,
  PREMIUM_LANDING_EXPERIMENT_NAME,
  PREMIUM_LANDING_VARIATIONS,
  premiumLandingExperimentOptions,
  premiumLandingTargetFromRoute,
  premiumLandingVariationFromSearch
} from '../../app/assets/js/matomo'

describe('premium landing experiment', () => {
  it('names the fresh experiment and its three variations', () => {
    expect(PREMIUM_LANDING_EXPERIMENT_NAME).toBe('PremiumLandingV2')
    expect(PREMIUM_LANDING_VARIATIONS).toEqual(['original', 'OfferFirst', 'VisualFirst'])
  })

  it('matches variation names the way Matomo does, including pk_ab_test lists', () => {
    expect(canonicalPremiumLandingVariation('visualfirst')).toBe('VisualFirst')
    expect(canonicalPremiumLandingVariation(' OfferFirst ')).toBe('OfferFirst')
    expect(canonicalPremiumLandingVariation('YearlyFocus')).toBeNull()
    expect(premiumLandingVariationFromSearch('?pk_ab_test=original')).toBe('original')
    expect(premiumLandingVariationFromSearch('?pk_ab_test=other,VisualFirst')).toBe('VisualFirst')
    expect(premiumLandingVariationFromSearch('?pk_ab_test=OfferFirst#pricing')).toBe('OfferFirst')
    expect(premiumLandingVariationFromSearch('?pk_ab_test=YearlyFocus')).toBeNull()
    expect(premiumLandingVariationFromSearch('')).toBeNull()
  })

  it('triggers only on the premium landing, including locale prefixes', () => {
    expect(isPremiumLandingPath('/premium')).toBe(true)
    expect(isPremiumLandingPath('/premium/')).toBe(true)
    expect(isPremiumLandingPath('/ru/premium')).toBe(true)
    expect(isPremiumLandingPath('/premium?pk_ab_test=OfferFirst')).toBe(true)
    expect(isPremiumLandingPath('/premium/dashboard')).toBe(false)
    expect(isPremiumLandingPath('/premium/sign-in')).toBe(false)
    expect(isPremiumLandingPath('/posts/rule34.xxx')).toBe(false)
    expect(isPremiumRoute('/premium')).toBe(true)
    expect(isPremiumRoute('/premium/')).toBe(true)
    expect(isPremiumRoute('/ru/premium')).toBe(true)
    expect(isPremiumRoute('/premium/sign-in')).toBe(true)
    expect(isPremiumRoute('/premium/dashboard')).toBe(true)
    expect(isPremiumRoute('/ja/premium/saved-posts/r34.app')).toBe(true)
    expect(isPremiumRoute('/premium/forgot-password?x=1')).toBe(true)
    expect(isPremiumRoute('/posts/rule34.xxx')).toBe(false)
    expect(isPremiumRoute('/premiumium')).toBe(false)

    const options = premiumLandingExperimentOptions(() => {}, { path: '/premium', search: '' })

    expect(options.name).toBe('PremiumLandingV2')
    expect(options.variations.map((variation) => variation.name)).toEqual(['original', 'OfferFirst', 'VisualFirst'])
    expect(options.trigger()).toBe(true)
    expect(premiumLandingExperimentOptions(() => {}, { path: '/premium/dashboard', search: '' }).trigger()).toBe(false)
    expect(
      premiumLandingTargetFromRoute({ path: '/premium', fullPath: '/premium?pk_ab_test=VisualFirst#pricing' })
    ).toEqual({
      path: '/premium',
      search: '?pk_ab_test=VisualFirst'
    })
  })
})
