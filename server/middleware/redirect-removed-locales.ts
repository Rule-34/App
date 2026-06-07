import { removedLocaleCodes } from '~~/config/i18n'

const removedLocalePrefixRe = new RegExp(`^/(${removedLocaleCodes.join('|')})(?:/|$)`)

/**
 * Permanent 301 redirects for retired locale URL prefixes.
 * Preserves path tail and query string so indexed /pl/posts/... URLs keep SEO equity on English routes.
 * Hash fragments are omitted — browsers never send them on HTTP requests, so Nitro cannot read or redirect them.
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  if (url.pathname === '/__nuxt_error' || !removedLocalePrefixRe.test(url.pathname)) {
    return
  }

  const strippedPath = url.pathname.replace(removedLocalePrefixRe, '/').replace(/\/{2,}/g, '/')
  const targetPath = strippedPath === '/' ? '/' : strippedPath.replace(/\/$/, '') || '/'

  await sendRedirect(event, `${targetPath}${url.search}`, 301)
})
