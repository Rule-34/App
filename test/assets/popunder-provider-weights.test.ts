import { describe, expect, it } from 'vitest'
import { popunderProviders, pushAdProviders } from '../../app/composables/useAdvertisements'

describe('popunder provider weights', () => {
  it('sums to 1.0', () => {
    const total = popunderProviders.reduce((sum, provider) => sum + provider.weight, 0)
    expect(total).toBeCloseTo(1, 5)
  })

  it('includes the Kadam trial and its required target class', () => {
    expect(popunderProviders.find(({ key }) => key === 'kadam')).toMatchObject({
      targetClass: 'hneuyk427249',
      noCrossorigin: true,
      weight: 0.1
    })
    expect(popunderProviders.find(({ key }) => key === 'profiton')).toMatchObject({ weight: 0.15 })
  })
})

describe('push ad provider weights', () => {
  it('sums to 1.0', () => {
    const total = pushAdProviders.reduce((sum, provider) => sum + provider.weight, 0)
    expect(total).toBeCloseTo(1, 5)
  })
})
