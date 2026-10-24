// The i18n module's messages route ignores the `<hash>` it is asked for. With `prerenderMessages` the messages of the
// current build are static files served before middleware, so any `/_i18n/**` request that reaches this point has a hash
// from another build: answering it would let the CDN cache the wrong messages as immutable.
// @see https://github.com/nuxt-modules/i18n/issues/3970
export default defineEventHandler((event) => {
  // Dev and the prerender pass (which generates those static files) have no current-build files to serve
  if (import.meta.dev || import.meta.prerender || !event.path.startsWith('/_i18n/')) {
    return
  }

  // Answer directly: the error handler would replace the cache header
  setResponseStatus(event, 404, 'Unknown i18n messages version')
  setResponseHeader(event, 'Cache-Control', 'no-store')

  return 'Unknown i18n messages version'
})
