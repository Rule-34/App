import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('~~/config/i18n', () => ({
  removedLocaleCodes: ['hi', 'fil', 'pl', 'th']
}))

let buildRemovedLocaleRedirectTarget: typeof import('../../app/assets/js/removed-locale-redirect').buildRemovedLocaleRedirectTarget

beforeAll(async () => {
  ;({ buildRemovedLocaleRedirectTarget } = await import('../../app/assets/js/removed-locale-redirect'))
})

describe('buildRemovedLocaleRedirectTarget', () => {
  it('redirects retired locale post paths to English', () => {
    expect(buildRemovedLocaleRedirectTarget('/pl/posts/rule34.xxx')).toBe('/posts/rule34.xxx')
  })

  it('preserves query strings', () => {
    expect(buildRemovedLocaleRedirectTarget('/th/posts/e621.net', '?tags=1girl')).toBe('/posts/e621.net?tags=1girl')
  })

  it('redirects retired locale tag landing pages', () => {
    expect(buildRemovedLocaleRedirectTarget('/fil/posts/e621.net/solo')).toBe('/posts/e621.net/solo')
  })

  it('redirects retired locale home prefixes to /', () => {
    expect(buildRemovedLocaleRedirectTarget('/hi/')).toBe('/')
    expect(buildRemovedLocaleRedirectTarget('/hi')).toBe('/')
  })

  it('does not redirect active locale prefixes', () => {
    expect(buildRemovedLocaleRedirectTarget('/ru/posts/rule34.xxx')).toBeNull()
    expect(buildRemovedLocaleRedirectTarget('/es/posts/rule34.xxx')).toBeNull()
    expect(buildRemovedLocaleRedirectTarget('/it/posts/rule34.xxx')).toBeNull()
  })

  it('does not redirect paths that merely contain retired locale codes', () => {
    expect(buildRemovedLocaleRedirectTarget('/posts/thighhighs')).toBeNull()
  })

  it('normalizes double slashes after stripping the locale prefix', () => {
    expect(buildRemovedLocaleRedirectTarget('/pl//posts/rule34.xxx')).toBe('/posts/rule34.xxx')
  })
})
