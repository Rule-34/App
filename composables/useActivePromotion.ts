import type { Promotion, MonthDay } from '~/config/promotions'
import { promotions } from '~/config/promotions'
import { useSessionStorage } from '@vueuse/core'

/**
 * Promotion with dynamically generated year-specific ID
 */
interface PromotionWithId extends Promotion {
  /** Year-specific ID (e.g., 'black-friday-2025') */
  id: string
}

/**
 * Check if a date falls within a month/day range (year-agnostic)
 */
function isWithinDateRange(current: Date, start: MonthDay, end: MonthDay): boolean {
  const currentMonth = current.getMonth() + 1 // getMonth() returns 0-11
  const currentDay = current.getDate()

  // Create comparable numbers: MMDD format
  const currentValue = currentMonth * 100 + currentDay
  const startValue = start.month * 100 + start.day
  const endValue = end.month * 100 + end.day

  return currentValue >= startValue && currentValue <= endValue
}

/**
 * Generate year-specific ID for a promotion
 */
function generatePromotionId(baseId: string, year: number): string {
  return `${baseId}-${year}`
}

/**
 * Composable to manage the currently active promotion
 * Handles promotion selection, dismissal state, and visibility logic
 * Promotions automatically recur every year
 */
export function useActivePromotion() {
  /**
   * Get the currently active promotion based on:
   * 1. Current date (month/day) is within promotion range
   * Returns the first matching promotion with a year-specific ID or null
   */
  const activePromotion = computed<PromotionWithId | null>(() => {
    const now = new Date()
    const currentYear = now.getFullYear()

    const active = promotions.find((promo) => {
      // Check if current date is within the promotion period (year-agnostic)
      return isWithinDateRange(now, promo.startDate, promo.endDate)
    })

    if (!active) return null

    // Add year-specific ID to the promotion
    return {
      ...active,
      id: generatePromotionId(active.baseId, currentYear)
    }
  })

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
   * True if there's an active promotion and it hasn't been dismissed
   */
  const shouldShow = computed(() => {
    if (!activePromotion.value) return false
    if (!dismissalState.value) return false

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

  return {
    /** The currently active promotion or null */
    activePromotion: readonly(activePromotion),

    /** Whether to show the promotional banner */
    shouldShow: readonly(shouldShow),

    /** Function to dismiss the current promotion */
    dismiss
  }
}
