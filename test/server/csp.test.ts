import { describe, expect, it } from 'vitest'

describe('Nuxt CSP upgrade-insecure-requests policy', () => {
  function shouldUpgradeInsecureRequests(nodeEnv: string, disableUpgradeEnv?: string): boolean {
    return nodeEnv === 'production' && disableUpgradeEnv !== 'true'
  }

  it('enables upgrade-insecure-requests by default in production', () => {
    expect(shouldUpgradeInsecureRequests('production', undefined)).toBe(true)
    expect(shouldUpgradeInsecureRequests('production', '')).toBe(true)
    expect(shouldUpgradeInsecureRequests('production', 'false')).toBe(true)
  })

  it('disables upgrade-insecure-requests when DISABLE_UPGRADE_INSECURE_REQUESTS is explicitly true in production', () => {
    expect(shouldUpgradeInsecureRequests('production', 'true')).toBe(false)
  })

  it('disables upgrade-insecure-requests in non-production environments', () => {
    expect(shouldUpgradeInsecureRequests('development', undefined)).toBe(false)
    expect(shouldUpgradeInsecureRequests('development', 'true')).toBe(false)
    expect(shouldUpgradeInsecureRequests('test', undefined)).toBe(false)
  })
})
