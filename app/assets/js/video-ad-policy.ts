export interface PauseAdEligibility {
  isAdActive: boolean
  isContentEnded: boolean
  isProgrammatic: boolean
  isRequestPending: boolean
  isVisible: boolean
  wasShown: boolean
}

export function getVideoAdSchedule(videoCount: number) {
  return {
    pauseRoll: videoCount > 0 && videoCount % 2 === 0,
    preRoll: videoCount > 3 && videoCount % 3 === 0
  }
}

export function shouldLoadVideoAds(isPremium: boolean, schedule: ReturnType<typeof getVideoAdSchedule>) {
  return !isPremium && (schedule.pauseRoll || schedule.preRoll)
}

export function isEligiblePauseAd({
  isAdActive,
  isContentEnded,
  isProgrammatic,
  isRequestPending,
  isVisible,
  wasShown
}: PauseAdEligibility) {
  return !isAdActive && !isContentEnded && !isProgrammatic && !isRequestPending && isVisible && !wasShown
}
