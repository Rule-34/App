import { getActivePromotion } from '~~/config/promotions'
import { useEventListener, useIntervalFn, useSessionStorage } from '@vueuse/core'

const REFRESH_INTERVAL_MS = 60_000

/**
 * Resolve the currently active seasonal campaign.
 *
 * `promotion-reference-time` is seeded on the server and serialized into the
 * Nuxt payload, so SSR and the first client render use the exact same instant
 * (no hydration mismatch). After hydration it refreshes periodically and when
 * the tab becomes visible, so an open page crosses campaign boundaries.
 */
export function useActivePromotion() {
  const { isPremium } = useUserData()
  const now = useState('promotion-reference-time', () => Date.now())

  function refresh() {
    now.value = Date.now()
  }

  const { resume } = useIntervalFn(refresh, REFRESH_INTERVAL_MS, { immediate: false })

  onMounted(() => {
    refresh()
    resume()
  })

  if (import.meta.client) {
    useEventListener(document, 'visibilitychange', () => {
      if (document.visibilityState === 'visible') refresh()
    })
  }

  const activePromotion = computed(() => getActivePromotion(new Date(now.value)))

  /**
   * Session storage for dismissal state.
   * Uses the year-specific ID so a dismissal does not leak into next year's campaign.
   * One reactive binding avoids creating a storage watcher per clock tick.
   */
  const dismissalKey = computed(() => `promotion-dismissed-${activePromotion.value?.id ?? 'none'}`)
  const dismissalState = useSessionStorage(dismissalKey, false, { writeDefaults: false })

  const shouldShow = computed(() => {
    if (!activePromotion.value) return false
    if (isPremium.value) return false

    return !dismissalState.value
  })

  function dismiss() {
    dismissalState.value = true
  }

  return {
    activePromotion: readonly(activePromotion),
    shouldShow: readonly(shouldShow),
    dismiss
  }
}
