import { describe, expect, it } from 'vitest'
import {
  buildChunkRecoveryStorageKey,
  chunkRecoveryAttemptMaxAgeMs,
  getRecoverableChunkLoadMessage,
  markChunkRecoveryAttempted,
  shouldAttemptChunkRecovery
} from '../../app/assets/js/chunk-error-recovery'

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem'> {
  private readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('chunk error recovery', () => {
  it('recognizes recoverable dynamic import failures', () => {
    expect(getRecoverableChunkLoadMessage(new TypeError('Importing a module script failed.'))).toBe(
      'Importing a module script failed.'
    )
    expect(getRecoverableChunkLoadMessage(new Error('Failed to fetch dynamically imported module'))).toBe(
      'Failed to fetch dynamically imported module'
    )
    expect(getRecoverableChunkLoadMessage(new Error('Cannot read properties of null'))).toBeNull()
  })

  it('retries a chunk failure once per URL for a short recovery window', () => {
    const storage = new MemoryStorage()
    const key = buildChunkRecoveryStorageKey('https://r34.app/posts/rule34.xxx')

    expect(shouldAttemptChunkRecovery({ storage, key, online: true, now: 10_000 })).toBe(true)

    markChunkRecoveryAttempted({ storage, key, now: 10_000 })

    expect(shouldAttemptChunkRecovery({ storage, key, online: true, now: 10_001 })).toBe(false)
    expect(
      shouldAttemptChunkRecovery({
        storage,
        key,
        online: true,
        now: 10_000 + chunkRecoveryAttemptMaxAgeMs + 1
      })
    ).toBe(true)
  })

  it('does not retry while the browser is offline', () => {
    const storage = new MemoryStorage()
    const key = buildChunkRecoveryStorageKey('https://r34.app/posts/rule34.xxx')

    expect(shouldAttemptChunkRecovery({ storage, key, online: false })).toBe(false)
  })
})
