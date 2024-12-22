import Tag from '~/assets/js/tag.dto'
import type { RouteLocationRaw } from 'vue-router'

export function generatePostsRoute(
  path: string = '/posts',
  domain?: string | undefined | null,
  page?: number | undefined | null,
  tags?: Tag[] | undefined | null,
  filters?: Object | undefined | null
) {
  const route: RouteLocationRaw = {
    path,
    query: {}
  }

  if (domain != null) {
    route.path = `${path}/${domain}`
  }

  if (page != null) {
    route.query.page = page.toString()
  }

  if (tags != null && Array.isArray(tags) && tags.length) {
    route.query.tags = tags.map((tag) => encodeURI(tag.name)).join('|')
  }

  // Check if object keys are not undefined
  if (filters != null && !isObjectEmpty(filters)) {
    route.query.filter = filters
  }

  return route
}

function isObjectEmpty(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}
