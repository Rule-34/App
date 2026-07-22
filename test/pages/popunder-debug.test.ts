import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const page = readFileSync(new URL('../../app/pages/__ad-debug/popunder.vue', import.meta.url), 'utf8')

describe('popunder debug page', () => {
  it('uses passive instrumentation and a same-origin post link', () => {
    expect(page).not.toMatch(/window\.open\s*=/)
    expect(page).not.toMatch(/window\.location\.(assign|replace)\s*=/)
    expect(page).toContain('data-testid="click-test-target"')
    expect(page).toContain('href="/posts/rule34.xxx?tags=rating%3Asafe"')
  })
})
