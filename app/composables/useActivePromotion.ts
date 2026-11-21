import type { Promotion, MonthDay } from '~~/config/promotions'
import { ghostOfferUrl, promotions } from '~~/config/promotions'
import { useSessionStorage } from '@vueuse/core'

/**
 * Promotion with dynamically generated year-specific ID
 */
interface PromotionWithId extends Promotion {
  /** Year-specific ID (e.g., 'black-friday-2025') */
  id: string
  /** End date resolved for the current year */
  endDate: MonthDay
}

/**
 * Check if a date falls within a month/day range (year-agnostic, UTC)
 */
function isWithinDateRange(current: Date, start: MonthDay, end: MonthDay): boolean {
  const currentMonth = current.getUTCMonth() + 1 // getUTCMonth() returns 0-11
  const currentDay = current.getUTCDate()

  // Create comparable numbers: MMDD format
  const currentValue = currentMonth * 100 + currentDay
  const startValue = start.month * 100 + start.day
  const endValue = end.month * 100 + end.day

  if (startValue <= endValue) {
    return currentValue >= startValue && currentValue <= endValue
  }

  return currentValue >= startValue || currentValue <= endValue
}

/**
 * Generate year-specific ID for a promotion
 */
function generatePromotionId(baseId: string, year: number): string {
  return `${baseId}-${year}`
}

/** The promotion active at `now` (UTC) with a year-specific ID, or null */
export function getActivePromotion(now: Date): PromotionWithId | null {
  const year = now.getUTCFullYear()
  const resolve = (date: Promotion['startDate']) => (typeof date === 'function' ? date(year) : date)

  const active = promotions.find((promo) => isWithinDateRange(now, resolve(promo.startDate), resolve(promo.endDate)))

  if (!active) return null

  return { ...active, id: generatePromotionId(active.baseId, year), endDate: resolve(active.endDate) }
}

/**
 * Composable to manage the currently active promotion
 * Handles promotion selection, dismissal state, and visibility logic
 * Promotions automatically recur every year
 */
export function useActivePromotion() {
  const { isPremium } = useUserData()

  /**
   * Get the currently active promotion based on:
   * 1. Current date (month/day) is within promotion range
   * Returns the first matching promotion with a year-specific ID or null
   */
  const activePromotion = computed(() => getActivePromotion(new Date()))

  /**
   * Session storage for dismissal state
   * Uses the year-specific ID to track dismissals (resets annually)
   */
  const dismissalState = computed(() => {
    if (!activePromotion.value) return null

    return useSessionStorage(`promotion-dismissed-${activePromotion.value.id}`, false, {
      writeDefaults: false
    })
  })

  /**
   * Whether the promotional banner should be shown
   * True if there's an active promotion, user is not premium, and it hasn't been dismissed
   */
  const shouldShow = computed(() => {
    if (!activePromotion.value) return false
    if (!dismissalState.value) return false
    if (isPremium.value) return false

    return !dismissalState.value.value
  })

  /**
   * Dismiss the current promotion for this session
   */
  function dismiss() {
    if (dismissalState.value) {
      dismissalState.value.value = true
    }
  }

  /** Card subscriptions open the Ghost offer; SellApp one-time plans get the coupon when there is one */
  function checkoutUrl(plan: string, link: { url: string; category: string }): string {
    const promotion = activePromotion.value

    if (plan === 'monthly' || plan === 'yearly') {
      return promotion && link.category === 'creditCard' ? ghostOfferUrl(promotion.offers[plan]) : link.url
    }

    if (!promotion?.sellAppCoupon) return link.url

    const url = new URL(link.url)
    url.searchParams.set('coupon', promotion.sellAppCoupon)
    return url.href
  }

  return {
    /** The currently active promotion or null */
    activePromotion: readonly(activePromotion),

    /** Whether to show the promotional banner */
    shouldShow: readonly(shouldShow),

    /** Function to dismiss the current promotion */
    dismiss,
    checkoutUrl
  }
}
