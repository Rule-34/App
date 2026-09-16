import { describe, expect, it } from 'vitest'
import { normalizeStringForTitle } from '../../app/assets/js/SeoHelper'

describe('normalizeStringForTitle', () => {
  it('returns null for empty strings or whitespace-only inputs', () => {
    expect(normalizeStringForTitle('')).toBeNull()
    expect(normalizeStringForTitle('   ')).toBeNull()
  })

  it('returns null for bare minus or whitespace following minus', () => {
    expect(normalizeStringForTitle('-')).toBeNull()
    expect(normalizeStringForTitle('-   ')).toBeNull()
  })

  it('formats single words in title case', () => {
    expect(normalizeStringForTitle('futanari')).toBe('Futanari')
    expect(normalizeStringForTitle('FEMALE')).toBe('Female')
  })

  it('converts underscore and hyphen delimited tags to space-separated title case', () => {
    expect(normalizeStringForTitle('overwatch_2')).toBe('Overwatch 2')
    expect(normalizeStringForTitle('hatsune_miku')).toBe('Hatsune Miku')
    expect(normalizeStringForTitle('high-resolution')).toBe('High Resolution')
  })

  it('preserves leading minus sign for negative tags while title-casing the tag content', () => {
    expect(normalizeStringForTitle('-female')).toBe('-Female')
    expect(normalizeStringForTitle('-overwatch_2')).toBe('-Overwatch 2')
    expect(normalizeStringForTitle('-hatsune_miku')).toBe('-Hatsune Miku')
  })
})
