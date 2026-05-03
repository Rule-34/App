/**
 * [TEMPORARY] Patches canonical <link> with ?tags= on SSR.
 *
 * @nuxtjs/i18n v10 canonicalQueries config is a no-op — the `app:rendered`
 * hook always overwrites the canonical with seo:true, stripping all params.
 *
 * TODO: Delete this file once upstream fixes canonicalQueries.
 *       Track: https://github.com/nuxt-modules/i18n
 *       See also: nuxt.config.js ~L369
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
