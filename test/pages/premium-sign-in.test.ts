import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('/premium/sign-in', () => {
  it('uses a hard redirect after sign in so auth-gated ads reset', () => {
    const source = readFileSync(new URL('../../app/pages/premium/sign-in.vue', import.meta.url), 'utf8')

    expect(source).toContain(
      "window.location.href = localePath({ path: '/premium/dashboard', query: { initialLogin: 'true' } })"
    )
    expect(source).not.toContain('await navigateTo({')
  })
})
