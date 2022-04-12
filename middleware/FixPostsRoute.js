import { RouterHelper } from '~/assets/js/RouterHelper'

function isRouteNotCorrect(context) {
  // Fix: we use the query's data since Vuex has not been updated yet with the request data.
  const URL_DOMAIN = context.query.domain
  const URL_PAGE = context.query.domain

  return URL_DOMAIN == null || URL_PAGE == null
}

function generateCorrectRoute(context) {
  // Fix: we use the query's data since Vuex has not been updated yet with the request data.
  const URL_DOMAIN = context.query.domain
  const URL_PAGE = context.query.page
  const URL_TAGS = context.query.tags

  return RouterHelper.generatePostsRouteWithDefaults(
    context.store,
    URL_DOMAIN,
    URL_PAGE,
    URL_TAGS
  )
}

export default function (context) {
  if (isRouteNotCorrect(context)) {
    console.info('Redirecting to correct route')

    const ROUTE = generateCorrectRoute(context)

    return context.redirect(422, undefined, ROUTE.query)
  }
}
