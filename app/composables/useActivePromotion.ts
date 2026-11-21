import { getActivePromotion } from '~~/config/promotions'
import { useSessionStorage } from '@vueuse/core'

/**
 * Resolve the currently active seasonal campaign.
 *
 * `promotion-reference-time` is seeded on the server and serialized into the
 * Nuxt payload, so SSR and the first client render use the exact same instant
 * (no hydration mismatch). It is refreshed after mount for long-lived tabs.
 */
export function useActivePromotion() {
  const { isPremium } = useUserData()
  const now = useState('promotion-reference-time', () => Date.now())

  onMounted(() => {
    now.value = Date.now()
  })

  const activePromotion = computed(() => getActivePromotion(new Date(now.value)))

  /**
   * Session storage for dismissal state.
   * Uses the year-specific ID so a dismissal does not leak into next year's campaign.
   */
  const dismissalState = computed(() => {
    if (!activePromotion.value) return null

    return useSessionStorage(`promotion-dismissed-${activePromotion.value.id}`, false, {
      writeDefaults: false
    })
  })

  const shouldShow = computed(() => {
    if (!activePromotion.value) return false
    if (isPremium.value) return false

    return !(dismissalState.value?.value ?? false)
  })

  function dismiss() {
    if (dismissalState.value) {
      dismissalState.value.value = true
    }
  }

  return {
    activePromotion: readonly(activePromotion),
    shouldShow: readonly(shouldShow),
    dismiss
  }
}
