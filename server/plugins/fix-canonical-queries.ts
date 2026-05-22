/**
 * [TEMPORARY WORKAROUND] Patches tagged posts canonical links on SSR.
 *
 * Context:
 * @nuxtjs/i18n v10 canonicalQueries config is a no-op. The module strips all
 * query params from the canonical URL during both SSR and client hydration.
 *
 * This plugin is PART OF A TWO-PART FIX:
 *   1. SSR (this file): Patches the rendered HTML to include or replace tags in
 *      the canonical link before it reaches the browser/SEO crawlers.
 *   2. CSR (pages/posts/[domain]/index.vue): A `useHead` call re-applies the
 *      canonical with tags after the i18n module overwrites it on hydration.
 *
 * Removal checklist (when upstream fixes canonicalQueries):
 *   - [ ] Delete this file
 *   - [ ] Remove the `useHead` canonical override in pages/posts/[domain]/index.vue
 *   - [ ] Remove the `canonicalQueries: ['tags']` line from nuxt.config.js
 *   - [ ] Update the comment block in nuxt.config.js
 *   - [ ] Delete test/server/fix-canonical-queries.test.ts (or update assertions)
 *
 * Track upstream: https://github.com/nuxt-modules/i18n
 */
import { generatePostTagLandingPath, getSinglePositiveTagQueryValue } from '../../assets/js/RouterHelper'

function withTagsQuery(href: string, tags: string): string {
  const parsed = new URL(href, 'https://example.com')
  parsed.searchParams.set('tags', tags)

  if (/^[a-z]+:\/\//i.test(href) || href.startsWith('//')) {
    return parsed.toString()
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}

function withTagCanonicalHref(href: string, tags: string, preferLandingPath: boolean): string {
  if (!preferLandingPath) {
    return withTagsQuery(href, tags)
  }

  const parsed = new URL(href, 'https://example.com')
  const match = parsed.pathname.match(/^(\/[a-z]{2})?\/posts\/([^/]+)$/)

  if (!match) {
    return withTagsQuery(href, tags)
  }

  const localePrefix = match[1] ?? ''
  const domain = match[2]

  if (!domain) {
    return withTagsQuery(href, tags)
  }

  parsed.pathname = generatePostTagLandingPath(domain, tags, `${localePrefix}/posts`)
  parsed.search = ''

  if (/^[a-z]+:\/\//i.test(href) || href.startsWith('//')) {
    return parsed.toString()
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}

function patchCanonicalTags(headHtml: string, tags: string, preferLandingPath: boolean): string {
  if (!tags) return headHtml

  const withCanonical = headHtml.replace(
    /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/i,
    (match: string, href: string) => {
      if (!href) return match
      return match.replace(href, withTagCanonicalHref(href, tags, preferLandingPath))
    }
  )

  return withCanonical.replace(
    /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi,
    (match: string, href: string) => {
      if (!href) return match
      return match.replace(href, withTagCanonicalHref(href, tags, preferLandingPath))
    }
  )
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const url = new URL(event.path, 'http://localhost')
    const tags = url.searchParams.get('tags')

    if (!tags) return

    // Only patch canonicals on posts index pages; tag landing pages keep clean self-canonicals.
    const isPostsIndexPath = /^(\/[a-z]{2})?\/posts\/[^/]+$/.test(url.pathname)
    if (!isPostsIndexPath) return

    const tagLandingTag = getSinglePositiveTagQueryValue(tags)
    const preferLandingPath =
      Boolean(tagLandingTag) && url.searchParams.size === 1 && url.searchParams.getAll('tags').length === 1

    const body = response.body
    if (typeof body !== 'string') return

    const headOpenIdx = body.indexOf('<head')
    if (headOpenIdx === -1) return

    const headStartIdx = body.indexOf('>', headOpenIdx)
    const headEndIdx = body.indexOf('</head>')
    if (headStartIdx === -1 || headEndIdx === -1) return

    const headHtml = body.slice(headStartIdx + 1, headEndIdx)

    const patchedHead = patchCanonicalTags(headHtml, tagLandingTag ?? tags, preferLandingPath)

    if (patchedHead === headHtml) return

    response.body = body.slice(0, headStartIdx + 1) + patchedHead + body.slice(headEndIdx)
  })
})
