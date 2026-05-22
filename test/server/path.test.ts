import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('~/config/i18n', () => ({
  localeCodes: new Set(['en', 'ru', 'es', 'ja', 'pt', 'de', 'fr'])
}))

let stripLocaleFromPath: typeof import('../../server/utils/path').stripLocaleFromPath

beforeAll(async () => {
  ;({ stripLocaleFromPath } = await import('../../server/utils/path'))
})

describe('stripLocaleFromPath', () => {
  it('removes a locale prefix from public posts paths', () => {
    expect(stripLocaleFromPath('/es/posts/e621.net')).toBe('/posts/e621.net')
  })

  it('preserves query strings and hashes when removing the locale prefix', () => {
    expect(stripLocaleFromPath('/ja/posts/e621.net?tags=solo#media')).toBe('/posts/e621.net?tags=solo#media')
  })

  it('does not strip non-locale first path segments', () => {
    expect(stripLocaleFromPath('/esoteric/posts/e621.net?tags=solo')).toBe('/esoteric/posts/e621.net?tags=solo')
  })

  it('normalizes locale root paths to slash', () => {
    expect(stripLocaleFromPath('/ru')).toBe('/')
    expect(stripLocaleFromPath('/ru/')).toBe('/')
  })
})
