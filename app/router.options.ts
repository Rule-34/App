import type { RouterConfig } from '@nuxt/schema'
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig>{
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }

    // === Custom

    if (shouldSkipIfOnlyPageQueryChanged(to, from)) {
      return undefined
    }

    return {
      left: 0,
      top: 0
    }
  }
}

function shouldSkipIfOnlyPageQueryChanged(to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) {
  const isSameRoute = to.path === from.path && to.hash === from.hash

  if (!isSameRoute) {
    return false
  }

  const pageIsNew = !from.query.page && to.query.page != null

  const isDifferentPageParam = from.query.page !== to.query.page

  if (!pageIsNew && !isDifferentPageParam) {
    return false
  }

  return areQueriesEqualWithoutPage(to.query, from.query)
}

function areQueriesEqualWithoutPage(
  toQuery: RouteLocationNormalized['query'],
  fromQuery: RouteLocationNormalized['query']
) {
  const { page: _toPage, ...toQueryWithoutPage } = toQuery
  const { page: _fromPage, ...fromQueryWithoutPage } = fromQuery

  const toKeys = Object.keys(toQueryWithoutPage)
  const fromKeys = Object.keys(fromQueryWithoutPage)

  if (toKeys.length !== fromKeys.length) {
    return false
  }

  return toKeys.every((key) => {
    if (!Object.prototype.hasOwnProperty.call(fromQueryWithoutPage, key)) {
      return false
    }

    return areQueryValuesEqual(toQueryWithoutPage[key], fromQueryWithoutPage[key])
  })
}

function areQueryValuesEqual(
  toValue: RouteLocationNormalized['query'][string] | undefined,
  fromValue: RouteLocationNormalized['query'][string] | undefined
) {
  if (Array.isArray(toValue) || Array.isArray(fromValue)) {
    if (!Array.isArray(toValue) || !Array.isArray(fromValue)) {
      return false
    }

    return toValue.length === fromValue.length && toValue.every((value, index) => value === fromValue[index])
  }

  return toValue === fromValue
}
