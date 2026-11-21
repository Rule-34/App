/**
 * Promotional campaigns configuration
 * Add or remove promotions from the array to enable/disable them
 * Promotions automatically recur every year based on month/day ranges
 */

/** Date without year (for recurring promotions) */
export interface MonthDay {
  /** Month (1-12) */
  month: number
  /** Day of month (1-31) */
  day: number
}

export interface Promotion {
  /** Base identifier for the promotion (year will be appended automatically) */
  baseId: string

  /** Promotion start date (month and day only) */
  startDate: MonthDay | ((year: number) => MonthDay)

  /** Promotion end date (month and day only) */
  endDate: MonthDay | ((year: number) => MonthDay)

  /** Main title/headline for the banner */
  title: string

  /** Optional description/subtitle */
  description?: string

  /** Discount percentage (for display) */
  discountPercent?: number

  /** Optional emoji to display with discount badge */
  emoji?: string

  /** Ghost offer IDs for the monthly and yearly subscriptions, see `ghostOfferUrl` */
  offers: { monthly: string; yearly: string }

  /** SellApp coupon for the 30-day and lifetime plans; without one those plans are not discounted */
  sellAppCoupon?: string

  /** Call-to-action button configuration */
  cta?: {
    /** Text for the CTA button */
    text: string
    /** Link URL for the CTA button */
    link: string
  }
}

/** Ghost Portal link that opens checkout with the offer applied */
export function ghostOfferUrl(offerId: string): string {
  return `https://www.refinedsoft.com/#/portal/offers/${offerId}`
}

/** Day `offset` days from US Thanksgiving (fourth Thursday of November) */
function thanksgivingOffset(year: number, offset: number): MonthDay {
  const firstWeekday = new Date(Date.UTC(year, 10, 1)).getUTCDay()
  const date = new Date(Date.UTC(year, 10, 22 + ((11 - firstWeekday) % 7) + offset))

  return { month: date.getUTCMonth() + 1, day: date.getUTCDate() }
}

/**
 * List of all promotional campaigns
 * Promotions automatically recur every year during their month/day range
 */
export const promotions: Promotion[] = [
  {
    baseId: 'halloween',
    startDate: { month: 10, day: 24 },
    endDate: { month: 11, day: 1 },
    title: 'pages.premium.landingPage.heroTitle',
    discountPercent: 30,
    emoji: '🎃',
    offers: { monthly: '6b0123fd08f0340001fabb0f', yearly: '6b0123fe08f0340001fabb11' },
    cta: { text: 'pages.premium.landingPage.getPremium', link: '/premium#pricing' }
  },
  {
    baseId: 'black-friday',
    // Monday before Thanksgiving through Cyber Monday
    startDate: (year) => thanksgivingOffset(year, -3),
    endDate: (year) => thanksgivingOffset(year, 4),
    title: 'promotions.blackFriday.title',
    description: 'promotions.blackFriday.description',
    discountPercent: 50,
    emoji: '🔥',
    offers: { monthly: '6983feb0b685ef00018f719b', yearly: '6983fed2b685ef00018f719d' },
    cta: {
      text: 'promotions.blackFriday.cta',
      link: '/premium#pricing'
    }
  },
  {
    baseId: 'christmas',
    startDate: { month: 12, day: 15 },
    endDate: { month: 12, day: 26 },
    title: 'pages.premium.landingPage.heroTitle',
    discountPercent: 30,
    emoji: '🎄',
    offers: { monthly: '6b0123ff08f0340001fabb13', yearly: '6b0123ff08f0340001fabb15' },
    cta: { text: 'pages.premium.landingPage.getPremium', link: '/premium#pricing' }
  },
  {
    baseId: 'new-year',
    startDate: { month: 12, day: 27 },
    endDate: { month: 1, day: 3 },
    title: 'pages.premium.landingPage.heroTitle',
    discountPercent: 30,
    emoji: '🥳',
    offers: { monthly: '6b01240008f0340001fabb17', yearly: '6b01240108f0340001fabb19' },
    cta: { text: 'pages.premium.landingPage.getPremium', link: '/premium#pricing' }
  },
  {
    baseId: 'valentines',
    startDate: { month: 2, day: 10 }, // February 10
    endDate: { month: 2, day: 15 }, // February 15
    title: 'promotions.valentines.title',
    description: 'promotions.valentines.description',
    discountPercent: 30,
    emoji: '💝',
    offers: { monthly: '6983ff2fb685ef00018f71a3', yearly: '6983ff52b685ef00018f71a5' },
    cta: {
      text: 'promotions.valentines.cta',
      link: '/premium#pricing'
    }
  },
  {
    baseId: 'pride',
    startDate: { month: 6, day: 1 },
    endDate: { month: 6, day: 30 },
    title: 'pages.premium.landingPage.heroTitle',
    discountPercent: 30,
    emoji: '🏳️‍🌈',
    offers: { monthly: '6b01708808f0340001fabb81', yearly: '6b01708908f0340001fabb83' },
    cta: { text: 'pages.premium.landingPage.getPremium', link: '/premium#pricing' }
  }
]
