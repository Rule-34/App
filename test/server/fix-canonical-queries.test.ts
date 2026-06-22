import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { defaultLocale, locales } from '../../config/i18n'
import { project } from '../../config/project'
import { debugBrowserOptions } from '../helper'

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

  function getJsonLd(html: string): Array<Record<string, unknown>> {
    return [...html.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)].map(
      (match) => JSON.parse(match[1] ?? '{}') as Record<string, unknown>
    )
  }

  function getGraphNodes(jsonLd: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    return jsonLd.flatMap((script) => {
      const graph = script['@graph']
      return Array.isArray(graph) ? (graph as Array<Record<string, unknown>>) : [script]
    })
  }

  function getBreadcrumbItemUrls(breadcrumb: Record<string, unknown>): string[] {
    const items = breadcrumb.itemListElement

    if (!Array.isArray(items)) return []

    return items
      .map((item) => {
        if (typeof item !== 'object' || item === null || !('item' in item)) return null

        const itemUrl = item.item

        if (typeof itemUrl === 'string') return itemUrl

        if (typeof itemUrl === 'object' && itemUrl !== null && '@id' in itemUrl && typeof itemUrl['@id'] === 'string') {
          return itemUrl['@id']
        }

        return null
      })
      .filter((itemUrl): itemUrl is string => itemUrl !== null)
  }

  it('canonicalizes simple single-tag posts queries to tag landing pages', async () => {
    const html = await $fetch('/posts/e621.net?tags=solo')

    expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net/solo`)
  })

  it('encodes pipe characters in tags', async () => {
    const html = await $fetch('/posts/e621.net?tags=bored%7Ccum%7C-white_fur')

    expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net?tags=bored%7Ccum%7C-white_fur`)
  })

  it('uses posts query canonicals for paginated tag pages', async () => {
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

  it('does not patch tag landing page canonicals when tags query is present', async () => {
    const html = await $fetch('/posts/e621.net/solo?tags=bar')

    expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net/solo`)
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
      const expectedHref = `${project.urls.production.origin}${prefix}/posts/e621.net/solo`
      expectedByLang.set(locale.code, expectedHref)
      expectedByLang.set(locale.language, expectedHref)
    }

    expectedByLang.set('x-default', `${project.urls.production.origin}/posts/e621.net/solo`)

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

  describe('Schema.org', () => {
    it('renders a single JSON-LD script on tag landing pages', async () => {
      const html = await $fetch('/posts/e621.net/solo')
      const jsonLd = getJsonLd(html)

      expect(jsonLd).toHaveLength(1)
      expect(getGraphNodes(jsonLd).map((node) => node['@type'])).toContain('BreadcrumbList')
    })

    it('keeps breadcrumb item URLs production-canonical and locale-aware', async () => {
      const html = await $fetch('/es/posts/e621.net/solo')
      const breadcrumbs = getGraphNodes(getJsonLd(html)).filter((node) => node['@type'] === 'BreadcrumbList')

      expect(breadcrumbs).toHaveLength(1)

      const itemUrls = getBreadcrumbItemUrls(breadcrumbs[0]!)

      expect(itemUrls.length).toBeGreaterThan(0)
      expect(itemUrls).toEqual([
        `${project.urls.production.origin}/es`,
        `${project.urls.production.origin}/es/posts/e621.net`,
        `${project.urls.production.origin}/es/posts/e621.net/solo`
      ])
    })
  })
})
