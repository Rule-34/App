import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { defaultLocale, locales } from '../../config/i18n'
import { project } from '../../config/project'
import { debugBrowserOptions } from '../helper'

const localeCodes = locales.map((l) => l.code)

describe('SEO canonical URLs', async () => {
  await setup({ browser: true, browserOptions: debugBrowserOptions })

  /** Extract canonical href from SSR HTML. */
  function getCanonical(html: string): string | null {
    const m = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/i)
    return m?.[1] ?? null
  }

  /** Extract og:image content from SSR HTML. */
  function getOgImage(html: string): string | null {
    const m = html.match(/<meta\b(?=[^>]*\bproperty=["']og:image["'])(?=[^>]*\bcontent=["']([^"']+)["'])[^>]*>/i)
    return m?.[1] ?? null
  }

  it('keeps single-tag posts canonicals on posts pages', async () => {
    const html = await $fetch('/posts/e621.net?tags=solo')

    expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net?tags=solo`)
  })

  it('encodes pipe characters in tags', async () => {
    const html = await $fetch('/posts/e621.net?tags=bored%7Ccum%7C-white_fur')

    expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net?tags=bored%7Ccum%7C-white_fur`)
  })

  it('strips non-canonical params (page) while keeping tags on paginated posts pages', async () => {
    const html = await $fetch('/posts/e621.net?page=4&tags=1girl')

    expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net?tags=1girl`)
  })

  it('strips all params when tags is absent', async () => {
    const html = await $fetch('/posts/e621.net?page=4')

    expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net`)
  })

  it('does not append tags to non-posts pages', async () => {
    const html = await $fetch('/?tags=solo')

    expect(getCanonical(html)).toBe(`${project.urls.production.origin}/`)
  })

  it('includes alternate hreflang links for all locales', async () => {
    const html = await $fetch('/es/posts/e621.net?tags=solo')

    const alternateTags = html.match(/<link\b(?=[^>]*\brel=["']alternate["'])[^>]*>/gi) || []
    const alternates = alternateTags
      .map((tag) => ({
        hreflang: tag.match(/hreflang=["']([^"']+)["']/)?.[1],
        href: tag.match(/href=["']([^"']+)["']/)?.[1]
      }))
      .filter((alternate): alternate is { hreflang: string; href: string } => !!alternate.hreflang && !!alternate.href)

    const alternatesByLang = new Map(alternates.map((alternate) => [alternate.hreflang, alternate.href]))

    const expectedByLang = new Map<string, string>()

    for (const locale of locales) {
      const prefix = locale.code === defaultLocale ? '' : `/${locale.code}`
      const expectedHref = `${project.urls.production.origin}${prefix}/posts/e621.net?tags=solo`
      expectedByLang.set(locale.code, expectedHref)
      expectedByLang.set(locale.language, expectedHref)
    }

    expectedByLang.set('x-default', `${project.urls.production.origin}/posts/e621.net?tags=solo`)

    expect([...alternatesByLang.keys()].sort()).toEqual([...expectedByLang.keys()].sort())

    for (const [hreflang, expectedHref] of expectedByLang.entries()) {
      expect(alternatesByLang.get(hreflang)).toBe(expectedHref)
    }
  })

  describe('OG image', () => {
    it('has an absolute og:image on the home page', async () => {
      const html = await $fetch('/')

      const ogImage = getOgImage(html)
      expect(ogImage).toBeTruthy()
      expect(ogImage).toMatch(/^https?:\/\//)
    })

    it('has an absolute og:image on posts pages', async () => {
      const html = await $fetch('/posts/e621.net?tags=solo')

      const ogImage = getOgImage(html)
      expect(ogImage).toBeTruthy()
      expect(ogImage).toMatch(/^https?:\/\//)
    })

    it('has only one og:image tag on posts pages', async () => {
      const html = await $fetch('/posts/e621.net?tags=solo')

      const matches = html.match(/<meta\b[^>]*\bproperty=["']og:image["']/gi)
      expect(matches?.length ?? 0).toBe(1)
    })

    it('has only one og:image tag', async () => {
      const html = await $fetch('/')

      const matches = html.match(/<meta\b[^>]*\bproperty=["']og:image["']/gi)
      expect(matches?.length ?? 0).toBe(1)
    })
  })
})
