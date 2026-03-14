import { describe, expect, it } from 'vitest'
import { normalizeSearchTagInput } from '../../assets/js/SearchTagInputHelper'

describe('normalizeSearchTagInput', () => {
  it('maps typed OR separators to pipes case-insensitively', () => {
    expect(normalizeSearchTagInput('cat OR dog')).toBe('cat|dog')
    expect(normalizeSearchTagInput('cat or dog')).toBe('cat|dog')
    expect(normalizeSearchTagInput('cat Or dog')).toBe('cat|dog')
    expect(normalizeSearchTagInput('cat oR dog')).toBe('cat|dog')
  })

  it('maps repeated typed OR separators to existing pipe semantics', () => {
    expect(normalizeSearchTagInput('cat OR dog or fish')).toBe('cat|dog|fish')
  })

  it('preserves existing behavior of converting spaces in tags to underscores', () => {
    expect(normalizeSearchTagInput('black hair')).toBe('black_hair')
    expect(normalizeSearchTagInput('black hair OR blue eyes')).toBe('black_hair|blue_eyes')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeSearchTagInput('  cat OR dog  ')).toBe('cat|dog')
  })
})
