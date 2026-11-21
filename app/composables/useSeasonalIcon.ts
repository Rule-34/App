import { getSeasonalEmoji, getSeasonalSeason } from '~~/config/promotions'

/**
 * Seasonal icon for the logo. The active campaign is the single source of
 * truth; Pride is the only season without a discount campaign.
 */
export function useSeasonalIcon() {
  const { activePromotion } = useActivePromotion()
  const now = useState('promotion-reference-time', () => Date.now())

  const season = computed(() => getSeasonalSeason(activePromotion.value, new Date(now.value)))
  const seasonalEmoji = computed(() => getSeasonalEmoji(activePromotion.value, new Date(now.value)))

  return {
    season,
    seasonalEmoji
  }
}
