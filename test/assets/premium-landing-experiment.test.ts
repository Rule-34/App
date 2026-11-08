import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import {
  activatePremiumLandingExperiment,
  canonicalPremiumLandingVariation,
  configureMatomo,
  currentPremiumLandingWriteId,
  markPremiumLandingWrite,
  isPremiumLandingPath,
  isPremiumRoute,
  PREMIUM_LANDING_EXPERIMENT_NAME,
  PREMIUM_LANDING_VARIATIONS,
  commitPremiumLandingAssignment,
  premiumLandingAssignmentStillApplies,
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
    expect(
      premiumLandingAssignmentStillApplies(
        { pathname: '/premium', search: '?utm_source=ad' },
        { path: '/premium', search: '' }
      )
    ).toBe(true)
    expect(
      premiumLandingAssignmentStillApplies(
        { pathname: '/premium', search: '?pk_ab_test=OfferFirst&utm_source=ad' },
        { path: '/premium', search: '?pk_ab_test=OfferFirst' }
      )
    ).toBe(true)
    expect(
      premiumLandingAssignmentStillApplies(
        { pathname: '/posts/rule34.xxx', search: '?utm_source=ad' },
        { path: '/premium', search: '' }
      )
    ).toBe(false)
    expect(
      premiumLandingAssignmentStillApplies(
        { pathname: '/premium', search: '?pk_ab_test=VisualFirst' },
        { path: '/premium', search: '' }
      )
    ).toBe(false)
  })

  it('keeps VisualFirst when a pending assignment resolves after a forced navigation', async () => {
    vi.useFakeTimers()
    const location = { pathname: '/premium', search: '', hash: '' }

    vi.stubGlobal('window', { _paq: [] as unknown[][] })
    vi.stubGlobal('location', location)
    vi.stubGlobal('localStorage', { getItem: () => null })
    vi.stubGlobal('document', {
      title: 'Premium',
      createElement: () => ({ src: '', async: true }),
      head: { appendChild() {} }
    })
    configureMatomo({ enabled: true })

    try {
      const pending = activatePremiumLandingExperiment({ path: '/premium', search: '' })

      location.search = '?pk_ab_test=VisualFirst'
      const forced = await activatePremiumLandingExperiment({
        path: '/premium',
        search: '?pk_ab_test=VisualFirst'
      })
      expect(forced).toBe('VisualFirst')

      await vi.advanceTimersByTimeAsync(4000)
      const stale = await pending
      expect(stale).toBe('original')

      let rendered = forced
      if (commitPremiumLandingAssignment(true, rendered, 'original', location, { path: '/premium', search: '' })) {
        rendered = stale
      }

      expect(rendered).toBe('VisualFirst')

      let replacedByMiddleware: 'original' | 'OfferFirst' | 'VisualFirst' = 'OfferFirst'
      if (
        commitPremiumLandingAssignment(
          true,
          replacedByMiddleware,
          'original',
          { pathname: '/premium', search: '?utm_source=ad' },
          {
            path: '/premium',
            search: ''
          }
        )
      ) {
        replacedByMiddleware = stale
      }

      expect(replacedByMiddleware).toBe('OfferFirst')
    } finally {
      vi.useRealTimers()
      vi.unstubAllGlobals()
      configureMatomo({ enabled: false })
    }
  })

  it('drops a forced query when navigating to /premium and restores it only when the address bar is empty', async () => {
    vi.stubGlobal('window', { _paq: [] as unknown[][], __premiumLandingSearch: '?pk_ab_test=VisualFirst' })
    vi.stubGlobal('localStorage', { getItem: () => null })
    configureMatomo({ enabled: false })

    try {
      vi.stubGlobal('location', { pathname: '/premium', search: '?pk_ab_test=VisualFirst', hash: '' })
      await expect(activatePremiumLandingExperiment({ path: '/premium', search: '' })).resolves.toBe('original')

      vi.stubGlobal('location', { pathname: '/premium', search: '', hash: '' })
      await expect(activatePremiumLandingExperiment({ path: '/premium', search: '' })).resolves.toBe('VisualFirst')
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('invalidates an in-flight landing write when a newer one is recorded', () => {
    const writeId = currentPremiumLandingWriteId()
    markPremiumLandingWrite()
    expect(currentPremiumLandingWriteId()).not.toBe(writeId)

    const page = readFileSync(new URL('../../app/pages/premium/index.vue', import.meta.url), 'utf8')
    const middleware = readFileSync(new URL('../../app/middleware/premium-landing.ts', import.meta.url), 'utf8')
    expect(page).toContain('const writeId = currentPremiumLandingWriteId()')
    expect(page).toContain('currentPremiumLandingWriteId() !== writeId')
    expect(page).toContain('markPremiumLandingWrite()')
    expect(middleware).toContain('markPremiumLandingWrite()')
  })
})
