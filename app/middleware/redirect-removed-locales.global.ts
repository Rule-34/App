import { buildRemovedLocaleRedirectTarget } from '~/assets/js/removed-locale-redirect'

export default defineNuxtRouteMiddleware((to) => {
  const url = URL.parse(to.fullPath, 'http://localhost')

  if (!url) {
    return
  }

  const target = buildRemovedLocaleRedirectTarget(url.pathname, url.search, url.hash)

  if (!target) {
    return
  }

  return navigateTo(target, { redirectCode: 301, replace: true })
})
