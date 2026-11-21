/**
 * Seasonal promotional campaigns
 *
 * One calendar drives the banner, the seasonal icon and premium checkout.
 * All boundaries are inclusive and resolved in UTC. Campaigns recur every
 * year; no years are hardcoded. The first matching campaign in `promotions`
 * wins if ranges ever overlap.
 */

export type CampaignId = 'halloween' | 'black-friday' | 'christmas' | 'new-year' | 'valentines'

export type SeasonalIcon = CampaignId | 'pride'

export interface CampaignDateRange {
  start: Date
  end: Date
}

export interface Promotion {
  /** Stable campaign identifier, also used as the seasonal icon key */
  baseId: CampaignId

  /** Translation key for the banner title */
  title: string

  /** Translation key for the banner description */
  description: string

  /** Discount percentage applied to monthly and yearly plans */
  discountPercent: number

  /** Emoji shown in the banner and as the seasonal icon */
  emoji: string

  /** Ghost offer IDs. The Portal link format lives in app/assets/js/promotion-checkout.ts */
  offers: {
    monthly: string
    yearly: string
  }

  /**
   * SellApp coupon applied to the 30-day and lifetime links with `?coupon=`.
   * `null` means no SellApp coupon exists yet, so those plans are not discounted
   * and the UI must not claim a discount for them.
   */
  sellAppCoupon: string | null

  cta: {
    text: string
    link: string
  }
}

export interface ActivePromotion extends Promotion {
  /** Year-specific ID (e.g. 'black-friday-2026'); dismissal resets each campaign */
  id: string

  /** Year the campaign started in (New Year starts in the previous calendar year) */
  year: number

  /** Resolved UTC range for this occurrence */
  range: CampaignDateRange
}

/** Runtime kill switch: set to false to disable every seasonal discount and icon. */
export const promotionsEnabled = true

const DAY_MS = 24 * 60 * 60 * 1000

function utcStart(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day))
}

function utcEnd(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, occurrence: number): Date {
  const first = new Date(Date.UTC(year, month - 1, 1))
  const offset = (weekday - first.getUTCDay() + 7) % 7

  return new Date(Date.UTC(year, month - 1, 1 + offset + (occurrence - 1) * 7))
}

export function getPromotionRange(baseId: CampaignId, year: number): CampaignDateRange {
  switch (baseId) {
    case 'halloween':
      return { start: utcStart(year, 10, 24), end: utcEnd(year, 11, 1) }

    case 'black-friday': {
      // US Thanksgiving is the 4th Thursday of November.
      const thanksgiving = nthWeekdayOfMonth(year, 11, 4, 4)

      return {
        start: new Date(thanksgiving.getTime() - 3 * DAY_MS),
        end: new Date(thanksgiving.getTime() + 4 * DAY_MS + (DAY_MS - 1))
      }
    }

    case 'christmas':
      return { start: utcStart(year, 12, 15), end: utcEnd(year, 12, 26) }

    case 'new-year':
      return { start: utcStart(year, 12, 27), end: utcEnd(year + 1, 1, 3) }

    case 'valentines':
      return { start: utcStart(year, 2, 10), end: utcEnd(year, 2, 15) }
  }
}

export function getActivePromotion(now: Date): ActivePromotion | null {
  if (!promotionsEnabled) return null

  const year = now.getUTCFullYear()
  const time = now.getTime()

  for (const promotion of promotions) {
    // Check the previous year too so ranges that cross New Year resolve on both sides.
    for (const startYear of [year, year - 1]) {
      const range = getPromotionRange(promotion.baseId, startYear)

      if (time >= range.start.getTime() && time <= range.end.getTime()) {
        return {
          ...promotion,
          id: `${promotion.baseId}-${startYear}`,
          year: startYear,
          range
        }
      }
    }
  }

  return null
}

export function getSeasonalSeason(active: Pick<ActivePromotion, 'baseId'> | null, now: Date): SeasonalIcon | null {
  if (active) return active.baseId

  return now.getUTCMonth() === 5 ? 'pride' : null
}

export function getSeasonalEmoji(active: Pick<ActivePromotion, 'emoji'> | null, now: Date): string | null {
  if (active) return active.emoji

  return now.getUTCMonth() === 5 ? '🏳️‍🌈' : null
}

export const promotions: Promotion[] = [
  {
    baseId: 'halloween',
    title: 'promotions.halloween.title',
    description: 'promotions.halloween.description',
    discountPercent: 30,
    emoji: '🎃',
    offers: {
      monthly: '6b0123fd08f0340001fabb0f',
      yearly: '6b0123fe08f0340001fabb11'
    },
    sellAppCoupon: null,
    cta: {
      text: 'promotions.halloween.cta',
      link: '/premium#pricing'
    }
  },
  {
    baseId: 'black-friday',
    title: 'promotions.blackFriday.title',
    description: 'promotions.blackFriday.description',
    discountPercent: 50,
    emoji: '🔥',
    offers: {
      monthly: '6983feb0b685ef00018f719b',
      yearly: '6983fed2b685ef00018f719d'
    },
    sellAppCoupon: null,
    cta: {
      text: 'promotions.blackFriday.cta',
      link: '/premium#pricing'
    }
  },
  {
    baseId: 'christmas',
    title: 'promotions.christmas.title',
    description: 'promotions.christmas.description',
    discountPercent: 30,
    emoji: '🎄',
    offers: {
      monthly: '6b0123ff08f0340001fabb13',
      yearly: '6b0123ff08f0340001fabb15'
    },
    sellAppCoupon: null,
    cta: {
      text: 'promotions.christmas.cta',
      link: '/premium#pricing'
    }
  },
  {
    baseId: 'new-year',
    title: 'promotions.newYear.title',
    description: 'promotions.newYear.description',
    discountPercent: 30,
    emoji: '🥳',
    offers: {
      monthly: '6b01240008f0340001fabb17',
      yearly: '6b01240108f0340001fabb19'
    },
    sellAppCoupon: null,
    cta: {
      text: 'promotions.newYear.cta',
      link: '/premium#pricing'
    }
  },
  {
    baseId: 'valentines',
    title: 'promotions.valentines.title',
    description: 'promotions.valentines.description',
    discountPercent: 30,
    emoji: '💝',
    offers: {
      monthly: '6983ff2fb685ef00018f71a3',
      yearly: '6983ff52b685ef00018f71a5'
    },
    sellAppCoupon: null,
    cta: {
      text: 'promotions.valentines.cta',
      link: '/premium#pricing'
    }
  }
]
