import { describe, expect, it } from 'vitest'
import {
  getActivePromotion,
  getPromotionRange,
  getSeasonalEmoji,
  getSeasonalSeason,
  promotions
} from '../../config/promotions'
import { ghostOfferUrl, withSellAppCoupon } from '../../app/assets/js/promotion-checkout'

const utc = (year: number, month: number, day: number, hour = 0, minute = 0, second = 0, ms = 0) =>
  new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms))

const byId = Object.fromEntries(promotions.map((promotion) => [promotion.baseId, promotion]))

describe('seasonal promotion data', () => {
  it('includes every campaign with the agreed discount', () => {
    expect(promotions.map((promotion) => promotion.baseId)).toEqual([
      'halloween',
      'black-friday',
      'christmas',
      'new-year',
      'valentines'
    ])

    expect(byId['black-friday']?.discountPercent).toBe(50)
    expect(byId.halloween?.discountPercent).toBe(30)
    expect(byId.christmas?.discountPercent).toBe(30)
    expect(byId['new-year']?.discountPercent).toBe(30)
    expect(byId.valentines?.discountPercent).toBe(30)
  })

  it('points at the verified Ghost offers', () => {
    expect(byId.halloween?.offers).toEqual({
      monthly: '6b0123fd08f0340001fabb0f',
      yearly: '6b0123fe08f0340001fabb11'
    })
    expect(byId['black-friday']?.offers).toEqual({
      monthly: '6983feb0b685ef00018f719b',
      yearly: '6983fed2b685ef00018f719d'
    })
    expect(byId.christmas?.offers).toEqual({
      monthly: '6b0123ff08f0340001fabb13',
      yearly: '6b0123ff08f0340001fabb15'
    })
    expect(byId['new-year']?.offers).toEqual({
      monthly: '6b01240008f0340001fabb17',
      yearly: '6b01240108f0340001fabb19'
    })
    expect(byId.valentines?.offers).toEqual({
      monthly: '6983ff2fb685ef00018f71a3',
      yearly: '6983ff52b685ef00018f71a5'
    })
  })
})

describe('getPromotionRange', () => {
  it('uses inclusive UTC boundaries for Halloween', () => {
    const range = getPromotionRange('halloween', 2026)

    expect(range.start.toISOString()).toBe('2026-10-24T00:00:00.000Z')
    expect(range.end.toISOString()).toBe('2026-11-01T23:59:59.999Z')
  })

  it('uses inclusive UTC boundaries for Christmas', () => {
    const range = getPromotionRange('christmas', 2026)

    expect(range.start.toISOString()).toBe('2026-12-15T00:00:00.000Z')
    expect(range.end.toISOString()).toBe('2026-12-26T23:59:59.999Z')
  })

  it('uses inclusive UTC boundaries for Valentine’s Day', () => {
    const range = getPromotionRange('valentines', 2028)

    expect(range.start.toISOString()).toBe('2028-02-10T00:00:00.000Z')
    expect(range.end.toISOString()).toBe('2028-02-15T23:59:59.999Z')
  })

  it('crosses the New Year boundary', () => {
    const range = getPromotionRange('new-year', 2026)

    expect(range.start.toISOString()).toBe('2026-12-27T00:00:00.000Z')
    expect(range.end.toISOString()).toBe('2027-01-03T23:59:59.999Z')
  })

  it.each([
    [2026, '2026-11-23T00:00:00.000Z', '2026-11-30T23:59:59.999Z'],
    [2027, '2027-11-22T00:00:00.000Z', '2027-11-29T23:59:59.999Z'],
    [2028, '2028-11-20T00:00:00.000Z', '2028-11-27T23:59:59.999Z'],
    [2029, '2029-11-19T00:00:00.000Z', '2029-11-26T23:59:59.999Z'],
    [2030, '2030-11-25T00:00:00.000Z', '2030-12-02T23:59:59.999Z']
  ])('computes the Black Friday week for %i', (year, start, end) => {
    const range = getPromotionRange('black-friday', year)

    expect(range.start.toISOString()).toBe(start)
    expect(range.end.toISOString()).toBe(end)
  })
})

describe('getActivePromotion', () => {
  it('is inclusive at both ends of a range', () => {
    expect(getActivePromotion(utc(2026, 10, 23, 23, 59, 59, 999))).toBeNull()
    expect(getActivePromotion(utc(2026, 10, 24))?.baseId).toBe('halloween')
    expect(getActivePromotion(utc(2026, 11, 1, 23, 59, 59, 999))?.baseId).toBe('halloween')
    expect(getActivePromotion(utc(2026, 11, 2))).toBeNull()
  })

  it('resolves the same New Year campaign on both sides of the year boundary', () => {
    const december = getActivePromotion(utc(2026, 12, 27))
    const january = getActivePromotion(utc(2027, 1, 3, 23, 59, 59, 999))

    expect(december?.id).toBe('new-year-2026')
    expect(january?.id).toBe('new-year-2026')
    expect(getActivePromotion(utc(2027, 1, 4))).toBeNull()
  })

  it('handles leap-year February', () => {
    expect(getActivePromotion(utc(2028, 2, 10))?.baseId).toBe('valentines')
    expect(getActivePromotion(utc(2028, 2, 15, 23, 59, 59, 999))?.baseId).toBe('valentines')
    expect(getActivePromotion(utc(2028, 2, 16))).toBeNull()
  })

  it('evaluates boundaries in UTC, not local time', () => {
    // 2026-11-02T00:00:00+07:00 is still 2026-11-01T17:00:00Z.
    expect(getActivePromotion(new Date('2026-11-02T00:00:00+07:00'))?.baseId).toBe('halloween')
    expect(getActivePromotion(new Date('2026-11-02T00:00:00Z'))).toBeNull()
  })

  it('has deterministic precedence for every day of 2026-2030', () => {
    const overlapping = promotions.filter((promotion) => {
      for (let year = 2026; year <= 2030; year++) {
        const a = getPromotionRange(promotion.baseId, year)

        for (const other of promotions) {
          if (other.baseId === promotion.baseId) continue

          const b = getPromotionRange(other.baseId, year)
          if (a.start <= b.end && b.start <= a.end) return true
        }
      }

      return false
    })

    expect(overlapping).toEqual([])
  })
})

describe('seasonal icon', () => {
  it.each(promotions)('shows the $baseId emoji while its campaign is active', (promotion) => {
    const active = getActivePromotion(getPromotionRange(promotion.baseId, 2026).start)

    expect(active?.baseId).toBe(promotion.baseId)
    expect(getSeasonalEmoji(active, utc(2026, 7, 1))).toBe(promotion.emoji)
    expect(getSeasonalSeason(active, utc(2026, 7, 1))).toBe(promotion.baseId)
  })

  it('keeps Pride as the only campaign-free season', () => {
    expect(getSeasonalSeason(null, utc(2026, 6, 15))).toBe('pride')
    expect(getSeasonalEmoji(null, utc(2026, 6, 15))).toBe('🏳️‍🌈')
    expect(getSeasonalSeason(null, utc(2026, 3, 1))).toBeNull()
    expect(getSeasonalEmoji(null, utc(2026, 3, 1))).toBeNull()
  })
})

describe('checkout links', () => {
  it('builds Ghost Portal offer links', () => {
    expect(ghostOfferUrl('abc123')).toBe('https://www.refinedsoft.com/#/portal/offers/abc123')
  })

  it('adds a SellApp coupon without dropping existing params', () => {
    expect(
      withSellAppCoupon('https://refinedsoft.sell.app/product/premium-lifetime?payment_method=XMR', 'HALLOWEEN')
    ).toBe('https://refinedsoft.sell.app/product/premium-lifetime?payment_method=XMR&coupon=HALLOWEEN')
    expect(withSellAppCoupon('https://refinedsoft.sell.app/product/premium-lifetime', null)).toBe(
      'https://refinedsoft.sell.app/product/premium-lifetime'
    )
  })
})
