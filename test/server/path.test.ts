import { beforeAll, describe, expect, it, vi } from 'vitest'
import { localeCodes, prefixedLocaleCodes, removedLocaleCodes } from '../../config/i18n'

vi.mock('~~/config/i18n', () => import('../../config/i18n'))

let stripLocaleFromPath: typeof import('../../server/utils/path').stripLocaleFromPath

beforeAll(async () => {
  ;({ stripLocaleFromPath } = await import('../../server/utils/path'))
})

describe('stripLocaleFromPath', () => {
  it('removes active locale prefixes from public posts paths', () => {
    for (const locale of prefixedLocaleCodes) {
      expect(stripLocaleFromPath(`/${locale}/posts/e621.net`)).toBe('/posts/e621.net')
    }
  })

  it('preserves query strings and hashes when removing the locale prefix', () => {
    expect(stripLocaleFromPath('/ja/posts/e621.net?tags=solo#media')).toBe('/posts/e621.net?tags=solo#media')
  })

  it('does not strip non-locale or retired locale first path segments', () => {
    expect(stripLocaleFromPath('/esoteric/posts/e621.net?tags=solo')).toBe('/esoteric/posts/e621.net?tags=solo')

    for (const locale of removedLocaleCodes) {
      expect(stripLocaleFromPath(`/${locale}/posts/e621.net`)).toBe(`/${locale}/posts/e621.net`)
    }
  })

  it('normalizes locale root paths to slash', () => {
    for (const locale of prefixedLocaleCodes) {
      expect(stripLocaleFromPath(`/${locale}`)).toBe('/')
      expect(stripLocaleFromPath(`/${locale}/`)).toBe('/')
    }
  })

  it('uses localeCodes from config/i18n', () => {
    expect(localeCodes.has('ru')).toBe(true)
    expect(localeCodes.has('fil')).toBe(false)
  })
})
