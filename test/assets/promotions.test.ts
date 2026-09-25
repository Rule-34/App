import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('~~/config/project', () => import('../../config/project'))

let premiumPromotions: typeof import('../../app/assets/js/promotions').premiumPromotions

beforeAll(async () => {
  ;({ premiumPromotions } = await import('../../app/assets/js/promotions'))
})

describe('premiumPromotions', () => {
  it('contains configured promotion items', () => {
    expect(premiumPromotions.length).toBeGreaterThan(0)
  })

  it('ensures each promotion has valid structure and properties', () => {
    for (const promo of premiumPromotions) {
      expect(promo.media).toBeTruthy()
      expect(typeof promo.media).toBe('string')
      expect(promo.media.startsWith('/img/promo/')).toBe(true)

      expect(typeof promo.mediaWidth).toBe('number')
      expect(promo.mediaWidth).toBeGreaterThan(0)

      expect(typeof promo.mediaHeight).toBe('number')
      expect(promo.mediaHeight).toBeGreaterThan(0)

      expect(['image', 'animated', 'iframe']).toContain(promo.mediaType)

      if (promo.link !== null) {
        expect(typeof promo.link).toBe('string')
        expect(promo.link.length).toBeGreaterThan(0)
      }
    }
  })
})
