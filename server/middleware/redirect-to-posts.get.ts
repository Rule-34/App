/**
 * Redirect to /posts/<domain> if query parameters [domain, page, tags] are set
 */
export default defineEventHandler(async (event) => {
  const urlObj = getRequestURL(event)

  // Don't touch error routes
  if (urlObj.pathname === '/__nuxt_error') {
    return
  }

  // Only execute on /
  if (urlObj.pathname !== '/') {
    return
  }

  const searchParams = urlObj.searchParams

  const searchParamsDomain = searchParams.get('domain')
  searchParams.delete('domain')

  if (!searchParamsDomain) {
    return
  }

  await sendRedirect(
    //
    event,
    '/posts/' + searchParamsDomain + '?' + searchParams.toString(),
    301
  )
})
