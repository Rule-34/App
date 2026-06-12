export interface BuildFluidPlayerAdListOptions {
  isPremium: boolean
  timesVideoHasRendered: number
}

export interface FluidPlayerAd {
  roll: 'preRoll'
  vastTag: string
}

export function buildFluidPlayerAdList({
  isPremium,
  timesVideoHasRendered
}: BuildFluidPlayerAdListOptions): FluidPlayerAd[] {
  if (isPremium) {
    return []
  }

  const adList: FluidPlayerAd[] = []

  // Keep on-pause rolls disabled while fluid-player 3.58.0 can throw when its on-pause ad DOM is missing.

  if (timesVideoHasRendered > 3 && timesVideoHasRendered % 3 === 0) {
    adList.push({
      roll: 'preRoll',

      /**
       * ExoClick
       * Pros:
       * Cons: Low revenue (9)
       */
      vastTag: 'https://s.magsrv.com/splash.php?idzone=5386496'
    })
  }

  return adList
}
