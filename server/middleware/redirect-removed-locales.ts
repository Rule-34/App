import { buildRemovedLocaleRedirectTarget } from '../../app/assets/js/removed-locale-redirect'

/**
 * Permanent 301 redirects for retired locale URL prefixes.
 * Preserves path tail and query string so indexed /pl/posts/... URLs keep SEO equity on English routes.
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  if (url.pathname === '/__nuxt_error') {
    return
  }

  const target = buildRemovedLocaleRedirectTarget(url.pathname, url.search, url.hash)

  if (!target) {
    return
  }

  await sendRedirect(event, target, 301)
})
