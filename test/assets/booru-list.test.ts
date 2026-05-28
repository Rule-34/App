import { describe, expect, it } from 'vitest'
import { hasDuplicateBooruDomain } from '../../app/assets/js/BooruList'

describe('hasDuplicateBooruDomain', () => {
  it('detects duplicate domains while ignoring the row being edited', () => {
    const boorus = [{ domain: 'alpha.example' }, { domain: 'beta.example' }, { domain: 'gamma.example' }]

    expect(hasDuplicateBooruDomain(boorus, 'beta.example', 1)).toBe(false)
    expect(hasDuplicateBooruDomain(boorus, 'beta.example', 0)).toBe(true)
    expect(hasDuplicateBooruDomain(boorus, 'missing.example', 0)).toBe(false)
  })
})
