export function useSeasonalIcon() {
  const season = computed(() => {
    const now = new Date()
    const month = now.getMonth() + 1 // 1-12
    const day = now.getDate()

    // New Year's: Jan 1
    if (month === 1 && day === 1) {
      return 'newyear'
    }

    // Valentine's Day: Feb 13-14
    if (month === 2 && day >= 13 && day <= 14) {
      return 'valentine'
    }

    // Pride Month: All of June
    if (month === 6) {
      return 'pride'
    }

    // Halloween: Oct 25-31
    if (month === 10 && day >= 25) {
      return 'halloween'
    }

    // Christmas: Dec 20-26
    if (month === 12 && day >= 20 && day <= 26) {
      return 'christmas'
    }

    return null
  })

  const seasonalEmoji = computed(() => {
    switch (season.value) {
      case 'newyear':
        return '🥳'
      case 'valentine':
        return '💝'
      case 'halloween':
        return '🎃'
      case 'christmas':
        return '🎄'
      case 'pride':
        return '🏳️‍🌈'
      default:
        return null
    }
  })

  return {
    season,
    seasonalEmoji
  }
}
