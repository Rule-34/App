export default defineNitroPlugin((nitroApp) => {
  /**
   * Nuxt/Vue renderer adds preload links late (after `render:html`),
   * so we patch the final HTML response body instead.
   */
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const path =
      // Nitro v2 often provides `event.path`
      (event as any)?.path?.split('?')?.[0] ??
      // Fallback for other runtimes
      (event as any)?.node?.req?.url?.split('?')?.[0]

    // Only apply on public posts pages; exclude premium routes.
    if (typeof path !== 'string' || !path.startsWith('/posts/')) {
      return
    }

    // Only patch HTML responses with a string body
    const body = (response as any)?.body
    if (typeof body !== 'string') {
      return
    }

    const contentType =
      (response as any)?.headers?.['content-type'] ?? (response as any)?.headers?.['Content-Type'] ?? ''

    if (typeof contentType === 'string' && contentType.length && !contentType.includes('text/html')) {
      return
    }

    const headOpenIdx = body.indexOf('<head')
    if (headOpenIdx === -1) {
      return
    }

    const headStartIdx = body.indexOf('>', headOpenIdx)
    const headEndIdx = body.indexOf('</head>')
    if (headStartIdx === -1 || headEndIdx === -1 || headEndIdx <= headStartIdx) {
      return
    }

    const headHtml = body.slice(headStartIdx + 1, headEndIdx)

    const patchedHead = headHtml.replace(
      /<link\b(?=[^>]*\brel=["']?preload["']?)(?=[^>]*\bas=["']?image["']?)(?![^>]*\bfetchpriority=)([^>]*)>/gi,
      '<link fetchpriority="high"$1>'
    )

    if (patchedHead === headHtml) {
      return
    }

    ;(response as any).body = body.slice(0, headStartIdx + 1) + patchedHead + body.slice(headEndIdx)
  })
})
