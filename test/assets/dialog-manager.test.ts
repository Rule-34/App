import { describe, expect, it } from 'vitest'
import { isPremiumRoute } from '../../app/composables/useDialogManagerState'

describe('isPremiumRoute', () => {
  it('matches Premium routes only', () => {
    expect(isPremiumRoute('premium')).toBe(true)
    expect(isPremiumRoute('premium-sign-in')).toBe(true)
    expect(isPremiumRoute('premium-dashboard')).toBe(true)
    expect(isPremiumRoute('index')).toBe(false)
    expect(isPremiumRoute('premium-content')).toBe(true)
    expect(isPremiumRoute('premium2')).toBe(false)
    expect(isPremiumRoute(Symbol('premium'))).toBe(false)
    expect(isPremiumRoute()).toBe(false)
  })
})
