// The icon follows the active promotion, so the icon and the discount always switch together
export function useSeasonalIcon() {
  const { activePromotion } = useActivePromotion()

  const seasonalEmoji = computed(() => activePromotion.value?.emoji ?? null)

  return {
    seasonalEmoji
  }
}
