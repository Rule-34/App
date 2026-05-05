/**
 * [TEMPORARY WORKAROUND] Patches canonical <link> with ?tags= on SSR.
 *
 * Context:
 * @nuxtjs/i18n v10 canonicalQueries config is a no-op. The module strips all
 * query params from the canonical URL during both SSR and client hydration.
 *
 * This plugin is PART OF A TWO-PART FIX:
 *   1. SSR (this file): Patches the rendered HTML to include ?tags= in the
 *      canonical link before it reaches the browser/SEO crawlers.
 *   2. CSR (pages/posts/[domain].vue): A `useHead` call re-applies the
 *      canonical with tags after the i18n module overwrites it on hydration.
 *
 * Removal checklist (when upstream fixes canonicalQueries):
 *   - [ ] Delete this file
 *   - [ ] Remove the `useHead` canonical override in pages/posts/[domain].vue
 *   - [ ] Remove the `canonicalQueries: ['tags']` line from nuxt.config.js
 *   - [ ] Update the comment block in nuxt.config.js
 *   - [ ] Delete test/server/fix-canonical-queries.test.ts (or update assertions)
 *
 * Track upstream: https://github.com/nuxt-modules/i18n
 */

function patchCanonicalTags(headHtml: string, tags: string): string {
  if (!tags) return headHtml
  return headHtml.replace(
    /(<link\b[^>]*\brel=["']canonical["'][^>]*href=["'])([^"']+)(["'][^>]*>)/i,
    (_match, before: string, href: string, after: string) => {
      if (!href) return `${before}${href}${after}`
      return `${before}${href}?tags=${encodeURIComponent(tags)}${after}`
    }
  )
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const url = new URL(event.path, 'http://localhost')
    const tags = url.searchParams.get('tags')

    if (!tags) return

    // Only patch canonical on posts pages
    if (!/^(\/[a-z]{2})?\/posts\//.test(url.pathname)) return

    const body = response.body
    if (typeof body !== 'string') return

    const headOpenIdx = body.indexOf('<head')
    if (headOpenIdx === -1) return

    const headStartIdx = body.indexOf('>', headOpenIdx)
    const headEndIdx = body.indexOf('</head>')
    if (headStartIdx === -1 || headEndIdx === -1) return

    const headHtml = body.slice(headStartIdx + 1, headEndIdx)

    const patchedHead = patchCanonicalTags(headHtml, tags)

    if (patchedHead === headHtml) return

    response.body = body.slice(0, headStartIdx + 1) + patchedHead + body.slice(headEndIdx)
  })
})
