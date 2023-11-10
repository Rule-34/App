import Tag from '~/assets/js/tag.dto'
import type { RouteLocationRaw } from 'vue-router'
import { isEmpty, isNil, omitBy } from 'lodash-es'

export function generatePostsRoute(
  domain?: string | undefined | null,
  page?: number | undefined | null,
  tags?: Tag[] | undefined | null,
  filters?: Object | undefined | null
) {
  const route: RouteLocationRaw = {
    path: '/posts',
    query: {}
  }

  if (domain != null) {
    route.query.domain = domain
  }

  if (page != null) {
    route.query.page = page.toString()
  }

  if (tags != null && Array.isArray(tags) && tags.length) {
    route.query.tags = tags.map((tag) => encodeURI(tag.name)).join('|')
  }

  // Check if object keys are not undefined
  if (filters != null && !objectIsEmpty(filters)) {
    route.query.filter = filters
  }

  return route
}

function objectIsEmpty(obj: Object) {
  return isEmpty(
    omitBy(
      obj,
      isNil)
  )
}
