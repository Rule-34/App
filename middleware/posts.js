import { RouterHelper } from '~/assets/js/RouterHelper'

function isUrlStateNotCorrect(context) {
  const URL_DOMAIN = context.store.getters['url/urlDomain']
  const URL_PAGE = context.store.getters['url/urlPage']

  return URL_DOMAIN === undefined || URL_PAGE === undefined
}

function generateCorrectRoute(context) {
  const URL_DOMAIN = context.store.getters['url/urlDomain']
  const URL_PAGE = context.store.getters['url/urlPage']
  const URL_TAGS = context.store.getters['url/urlTags']

  return RouterHelper.generatePostsRouteWithDefaults(
    context.store,
    URL_DOMAIN,
    URL_PAGE,
    URL_TAGS
  )
}

export default function (context) {
  if (isUrlStateNotCorrect(context)) {
    console.info('Middleware fixed route')

    const ROUTE = generateCorrectRoute(context)

    return context.redirect(422, undefined, ROUTE.query)
  }
}
