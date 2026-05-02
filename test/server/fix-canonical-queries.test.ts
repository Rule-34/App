import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { locales } from '../../config/i18n'

const localeCodes = locales.map((l) => l.code)

describe('SEO canonical URLs', async () => {
  await setup()

  /** Extract canonical href from SSR HTML. */
  function getCanonical(html: string): string | null {
    const m = html.match(/rel="canonical"\s+href="([^"]+)"/)
    return m?.[1] ?? null
  }

  it('includes tags in canonical when present', async () => {
    const html = await $fetch('/posts/e621.net?tags=solo')

    expect(getCanonical(html)).toBe('https://r34.app/posts/e621.net?tags=solo')
  })

  it('encodes pipe characters in tags', async () => {
    const html = await $fetch('/posts/e621.net?tags=bored%7Ccum%7C-white_fur')

    expect(getCanonical(html)).toBe('https://r34.app/posts/e621.net?tags=bored%7Ccum%7C-white_fur')
  })

  it('strips non-canonical params (page) while keeping tags', async () => {
    const html = await $fetch('/posts/e621.net?page=4&tags=1girl')

    expect(getCanonical(html)).toBe('https://r34.app/posts/e621.net?tags=1girl')
  })

  it('strips all params when tags is absent', async () => {
    const html = await $fetch('/posts/e621.net?page=4')

    expect(getCanonical(html)).toBe('https://r34.app/posts/e621.net')
  })

  it('does not append tags to non-posts pages', async () => {
    const html = await $fetch('/?tags=solo')

    expect(getCanonical(html)).toBe('https://r34.app/')
  })

  it('includes alternate hreflang links for all locales', async () => {
    const html = await $fetch('/es/posts/e621.net?tags=solo')

    const alternateTags = html.match(/<link\b[^>]*rel="alternate"[^>]*>/gi) || []
    const codes = alternateTags.map((tag) => tag.match(/hreflang="([^"]+)"/)?.[1]).filter(Boolean)

    const expected = [...localeCodes, 'x-default']
    expect(codes).toEqual(expect.arrayContaining(expected))
  })
})
