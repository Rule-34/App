import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { locales } from '../../config/i18n'
import { project } from '../../config/project'

const localeCodes = locales.map((l) => l.code)

describe('SEO canonical URLs', async () => {
  await setup()

  /** Extract canonical href from SSR HTML. */
  function getCanonical(html: string): string | null {
    const m = html.match(
      /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/i
    )
    return m?.[1] ?? null
  }

  it('includes tags in canonical when present', async () => {
    const html = await $fetch('/posts/e621.net?tags=solo')

    expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net?tags=solo`)
  })

  it('encodes pipe characters in tags', async () => {
    const html = await $fetch('/posts/e621.net?tags=bored%7Ccum%7C-white_fur')

    expect(getCanonical(html)).toBe(
      `${project.urls.production.origin}/posts/e621.net?tags=bored%7Ccum%7C-white_fur`
    )
  })

  it('strips non-canonical params (page) while keeping tags', async () => {
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

    const alternateTags =
      html.match(/<link\b(?=[^>]*\brel=["']alternate["'])[^>]*>/gi) || []
    const codes = alternateTags
      .map((tag) => tag.match(/hreflang=["']([^"']+)["']/)?.[1])
      .filter(Boolean)

    const expected = [...localeCodes, 'x-default']
    expect(codes.sort()).toEqual(expected.sort())
  })

  /**
   * Canonical must always point to the main production domain so clone/mirror
   * domains do not dilute SEO authority or get indexed as separate sites.
   */
  describe('clone domain canonicalization', () => {
    it('posts page on clone host canonicalizes to main domain', async () => {
      const html = await $fetch('/posts/e621.net?tags=solo', {
        headers: { Host: 'alt3.r34.app' }
      })

      expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net?tags=solo`)
    })

    it('locale-prefixed route on external clone host canonicalizes to main domain', async () => {
      const html = await $fetch('/es/posts/e621.net?tags=solo', {
        headers: { Host: 'naughtyneko.com' }
      })

      expect(getCanonical(html)).toBe(`${project.urls.production.origin}/es/posts/e621.net?tags=solo`)
    })

    it('home page on clone host canonicalizes to main domain', async () => {
      const html = await $fetch('/', {
        headers: { Host: 'alt3.r34.app' }
      })

      expect(getCanonical(html)).toBe(`${project.urls.production.origin}/`)
    })
  })
})
