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
  startDate: MonthDay

  /** Promotion end date (month and day only) */
  endDate: MonthDay

  /** Main title/headline for the banner */
  title: string

  /** Optional description/subtitle */
  description?: string

  /** Discount percentage (for display) */
  discountPercent?: number

  /** Optional emoji to display with discount badge */
  emoji?: string

  /** Promotional code for monthly subscription */
  monthlyCode: string

  /** Promotional code for yearly subscription */
  yearlyCode: string

  /** Call-to-action button configuration */
  cta?: {
    /** Text for the CTA button */
    text: string
    /** Link URL for the CTA button */
    link: string
  }
}

/**
 * List of all promotional campaigns
 * Promotions automatically recur every year during their month/day range
 */
export const promotions: Promotion[] = [
  {
    baseId: 'black-friday',
    startDate: { month: 11, day: 25 }, // November 25
    endDate: { month: 12, day: 5 }, // December 5
    title: 'Black Friday Sale',
    description: 'Get Premium at half price!',
    discountPercent: 50,
    emoji: '🔥',
    monthlyCode: 'BLACKFRIDAY-MONTHLY',
    yearlyCode: 'BLACKFRIDAY-YEARLY',
    cta: {
      text: 'Get Premium',
      link: '/premium#pricing'
    }
  },
  {
    baseId: 'valentines',
    startDate: { month: 2, day: 10 }, // February 10
    endDate: { month: 2, day: 15 }, // February 15
    title: "Valentine's Day Special",
    description: 'Love is in the air! Get 30% off Premium',
    discountPercent: 30,
    emoji: '💝',
    monthlyCode: 'LOVE-MONTHLY',
    yearlyCode: 'LOVE-YEARLY',
    cta: {
      text: 'Get Premium',
      link: '/premium#pricing'
    }
  }
]
