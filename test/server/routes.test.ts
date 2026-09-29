import { $fetch, fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { defaultLocale, locales, prefixedLocaleCodes, removedLocaleCodes } from '../../config/i18n'
import { project } from '../../config/project'
import { serverSetupConfig } from '../helper'

describe('Server & Nitro Routes', async () => {
  await setup(serverSetupConfig)

  describe('Booru API test mocks', () => {
    it('serves the first posts page from the local Nitro mock', async () => {
      const response = await $fetch<{ data: Array<{ id: number }>; links: { self: string; next: string } }>(
        '/booru/gelbooru/posts?baseEndpoint=safebooru.org&pageID=0&limit=30'
      )

      expect(response.data).toHaveLength(30)
      expect(response.data[0]?.id).toBe(4414654)
      expect(response.links.self).toContain('/booru/gelbooru/posts?')
      expect(response.links.next).toContain('pageID=1')
    })

    it('preserves tags in localized pagination links', async () => {
      const response = await $fetch<{ links: { self: string; next: string } }>(
        '/booru/gelbooru/posts?baseEndpoint=safebooru.org&pageID=0&limit=30&tags=hair_bun'
      )

      expect(response.links.self).toContain('tags=hair_bun')
      expect(response.links.next).toContain('tags=hair_bun')
    })
  })

  describe('Sitemap', () => {
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

  describe('SEO canonical URLs', () => {
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
      return [
        ...html.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)
      ].map((match) => JSON.parse(match[1] ?? '{}') as Record<string, unknown>)
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

          if (
            typeof itemUrl === 'object' &&
            itemUrl !== null &&
            '@id' in itemUrl &&
            typeof itemUrl['@id'] === 'string'
          ) {
            return itemUrl['@id']
          }

          return null
        })
        .filter((itemUrl): itemUrl is string => itemUrl !== null)
    }

    it('canonicalizes simple single-tag posts queries to tag landing pages', async () => {
      const html = await $fetch<string>('/posts/e621.net?tags=solo')

      expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net/solo`)
    })

    it('canonicalizes danbooru posts queries to tag landing pages', async () => {
      const html = await $fetch<string>('/posts/danbooru.donmai.us?tags=genshin_impact')

      expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/danbooru.donmai.us/genshin_impact`)
    })

    it('encodes pipe characters in tags', async () => {
      const html = await $fetch<string>('/posts/e621.net?tags=bored%7Ccum%7C-white_fur')

      expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net?tags=bored%7Ccum%7C-white_fur`)
    })

    it('uses posts query canonicals for paginated tag pages', async () => {
      const html = await $fetch<string>('/posts/e621.net?page=4&tags=1girl')

      expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net?tags=1girl`)
    })

    it('strips all params when tags is absent', async () => {
      const html = await $fetch<string>('/posts/e621.net?page=4')

      expect(getCanonical(html)).toBe(`${project.urls.production.origin}/posts/e621.net`)
    })

    it('does not append tags to non-posts pages', async () => {
      const html = await $fetch<string>('/?tags=solo')

      expect(getCanonical(html)).toBe(`${project.urls.production.origin}/`)
    })

    it('includes alternate hreflang links for all locales', async () => {
      const html = await $fetch<string>('/es/posts/e621.net?tags=solo')

      const alternateTags = html.match(/<link\b(?=[^>]*\brel=["']alternate["'])[^>]*>/gi) || []
      const alternates = alternateTags
        .map((tag) => ({
          hreflang: tag.match(/hreflang=["']([^"']+)["']/)?.[1],
          href: tag.match(/href=["']([^"']+)["']/)?.[1]
        }))
        .filter(
          (alternate): alternate is { hreflang: string; href: string } => !!alternate.hreflang && !!alternate.href
        )

      expect(alternates).toHaveLength(new Set(alternates.map((alternate) => alternate.hreflang)).size)
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
        const html = await $fetch<string>('/')

        const ogImage = getOgImage(html)
        expect(ogImage).toBeTruthy()
        expect(ogImage).toMatch(/^https?:\/\//)
      })

      it('has an absolute og:image on posts pages', async () => {
        const html = await $fetch<string>('/posts/e621.net?tags=solo')

        const ogImage = getOgImage(html)
        expect(ogImage).toBeTruthy()
        expect(ogImage).toMatch(/^https?:\/\//)
      })

      it('has only one og:image tag on posts pages', async () => {
        const html = await $fetch<string>('/posts/e621.net?tags=solo')

        const matches = html.match(/<meta\b[^>]*\bproperty=["']og:image["']/gi)
        expect(matches?.length ?? 0).toBe(1)
      })

      it('has only one og:image tag', async () => {
        const html = await $fetch<string>('/')

        const matches = html.match(/<meta\b[^>]*\bproperty=["']og:image["']/gi)
        expect(matches?.length ?? 0).toBe(1)
      })
    })

    describe('Schema.org', () => {
      it('renders a single JSON-LD script on tag landing pages', async () => {
        const html = await $fetch<string>('/posts/e621.net/solo')
        const jsonLd = getJsonLd(html)

        expect(jsonLd).toHaveLength(1)
        expect(getGraphNodes(jsonLd).map((node) => node['@type'])).toContain('BreadcrumbList')
      })

      it('keeps breadcrumb item URLs production-canonical and locale-aware', async () => {
        const html = await $fetch<string>('/es/posts/e621.net/solo')
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

  describe('redirect removed locales middleware', () => {
    it.each(removedLocaleCodes.map((locale) => [locale, `/posts/rule34.xxx`]))(
      'returns 301 for /%s/posts/...',
      async (locale, suffix) => {
        const response = await fetch(`/${locale}${suffix}`, { redirect: 'manual' })

        expect(response.status).toBe(301)
        expect(response.headers.get('location')).toBe(suffix)
      }
    )

    it('preserves query strings on 301 redirects', async () => {
      const response = await fetch('/th/posts/e621.net?tags=1girl', { redirect: 'manual' })

      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toBe('/posts/e621.net?tags=1girl')
    })

    it('omits hash fragments from redirect targets', async () => {
      const response = await fetch('/th/posts/e621.net?tags=1girl#media', { redirect: 'manual' })

      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toBe('/posts/e621.net?tags=1girl')
    })

    it('redirects retired locale home prefixes to /', async () => {
      const response = await fetch('/hi/', { redirect: 'manual' })

      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toBe('/')
    })

    it('normalizes double slashes after stripping the locale prefix', async () => {
      const response = await fetch('/pl//posts/rule34.xxx', { redirect: 'manual' })

      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toBe('/posts/rule34.xxx')
    })

    it('does not redirect paths that merely contain retired locale codes', async () => {
      const response = await fetch('/posts/thighhighs', { redirect: 'manual' })

      expect(response.status).not.toBe(301)
    })

    it('does not redirect active locale prefixes', async () => {
      const response = await fetch('/ru/posts/rule34.xxx', { redirect: 'manual' })

      expect(response.status).not.toBe(301)
    })
  })
})
