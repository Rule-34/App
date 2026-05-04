import { stripLocaleFromPath } from '~/composables/locale'

export default defineNitroPlugin((nitroApp) => {
  /**
   * Nuxt Image Module doesnt add fetchpriority=high on preload links for images
   * so we patch the final HTML response body instead.
   */
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const normalizedPath = stripLocaleFromPath(event.path)

    // Only apply on public posts pages; exclude premium routes.
    if (!normalizedPath.startsWith('/posts/')) {
      return
    }

    const body = response.body
    if (typeof body !== 'string') return

    const headOpenIdx = body.indexOf('<head')
    if (headOpenIdx === -1) return

    const headStartIdx = body.indexOf('>', headOpenIdx)
    const headEndIdx = body.indexOf('</head>')
    if (headStartIdx === -1 || headEndIdx === -1 || headEndIdx <= headStartIdx) return

    const headHtml = body.slice(headStartIdx + 1, headEndIdx)

    const patchedHead = headHtml.replace(
      /<link\b(?=[^>]*\brel=["']?preload["']?)(?=[^>]*\bas=["']?image["']?)(?![^>]*\bfetchpriority=)([^>]*)>/gi,
      '<link fetchpriority="high"$1>'
    )

    if (patchedHead === headHtml) {
      console.warn('[lcp-preload-fetchpriority] Already patched or no matching preload links found in head.')
      return
    }

    response.body = body.slice(0, headStartIdx + 1) + patchedHead + body.slice(headEndIdx)
  })
})
