import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { prefixedLocaleCodes } from '../../config/i18n'
import { debugBrowserOptions } from '../helper'

describe('Sitemap', async () => {
  await setup({ browser: true, browserOptions: debugBrowserOptions })

  function getLocs(xml: string): string[] {
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? '')
  }

  async function getSitemapLocs(path: string): Promise<string[]> {
    const xml = await $fetch<string>(path)
    const locs = getLocs(xml)
    const childSitemapPaths = locs
      .filter((loc) => loc.endsWith('.xml'))
      .map((loc) => URL.parse(loc))
      .filter((url): url is URL => url !== null)
      .map((url) => `${url.pathname}${url.search}`)

    if (childSitemapPaths.length === 0) {
      return locs
    }

    const childLocs = await Promise.all(childSitemapPaths.map((childPath) => getSitemapLocs(childPath)))
    return childLocs.flat()
  }

  it('does not duplicate locale prefixes in generated URLs', async () => {
    const locs = await getSitemapLocs('/sitemap.xml')

    expect(locs.length).toBeGreaterThan(0)

    for (const localeCode of prefixedLocaleCodes) {
      expect(locs.some((loc) => URL.parse(loc)?.pathname.startsWith(`/${localeCode}/`) ?? false)).toBe(true)
      expect(locs.some((loc) => URL.parse(loc)?.pathname.includes(`/${localeCode}/${localeCode}/`) ?? false)).toBe(
        false
      )
    }
  })

  it('excludes ad debug routes', async () => {
    const locs = await getSitemapLocs('/sitemap.xml')

    expect(locs.some((loc) => URL.parse(loc)?.pathname.startsWith('/__ad-debug/') ?? false)).toBe(false)
  })
})
