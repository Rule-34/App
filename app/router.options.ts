import type { RouterConfig } from '@nuxt/schema'
import qs from 'qs'
import { isEqual } from 'lodash-es'
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig>{
  // Fix router query parser - https://github.com/vuejs/vue-router/issues/1259#issuecomment-1571553624
  parseQuery: qs.parse,

  stringifyQuery: qs.stringify,

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

  const toQueryWithoutPage = { ...to.query, page: undefined }
  const fromQueryWithoutPage = { ...from.query, page: undefined }

  const queriesWithoutPageAreEqual = isEqual(toQueryWithoutPage, fromQueryWithoutPage)

  // console.log('toQueryWithoutPage', toQueryWithoutPage)
  // console.log('fromQueryWithoutPage', fromQueryWithoutPage)

  // if (!queriesWithoutPageAreEqual) {
  //   return false
  // }

  return true
}
