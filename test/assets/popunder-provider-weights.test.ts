import { describe, expect, it } from 'vitest'
import { popunderProviders, pushAdProviders } from '../../app/composables/useAdvertisements'

describe('popunder provider weights', () => {
  it('sums to 1.0', () => {
    const total = popunderProviders.reduce((sum, provider) => sum + provider.weight, 0)
    expect(total).toBeCloseTo(1, 5)
  })
})

describe('push ad provider weights', () => {
  it('sums to 1.0', () => {
    const total = pushAdProviders.reduce((sum, provider) => sum + provider.weight, 0)
    expect(total).toBeCloseTo(1, 5)
  })
})
