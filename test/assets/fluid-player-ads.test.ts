import { describe, expect, it } from 'vitest'
import { buildFluidPlayerAdList } from '../../app/assets/js/fluid-player-ads'

describe('buildFluidPlayerAdList', () => {
  it('does not configure on-pause roll ads because Fluid Player crashes when their DOM is missing', () => {
    expect(buildFluidPlayerAdList({ isPremium: false, timesVideoHasRendered: 2 })).not.toContainEqual(
      expect.objectContaining({ roll: 'onPauseRoll' })
    )
  })

  it('keeps preroll ads for non-premium users on the existing cadence', () => {
    expect(buildFluidPlayerAdList({ isPremium: false, timesVideoHasRendered: 6 })).toContainEqual(
      expect.objectContaining({ roll: 'preRoll' })
    )
  })

  it('does not configure video ads for premium users', () => {
    expect(buildFluidPlayerAdList({ isPremium: true, timesVideoHasRendered: 6 })).toEqual([])
  })
})
