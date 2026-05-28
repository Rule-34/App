import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('/premium/sign-in', () => {
  it('uses a hard redirect after sign in so auth-gated ads reset', () => {
    const source = readFileSync(new URL('../../app/pages/premium/sign-in.vue', import.meta.url), 'utf8')

    expect(source).toMatch(/window\.location\.href\s*=\s*localePath\(/)
    expect(source).toMatch(/path:\s*['"]\/premium\/dashboard['"]/)
    expect(source).toMatch(/initialLogin:\s*['"]true['"]/)
    expect(source).not.toMatch(/navigateTo\s*\(/)
  })
})
