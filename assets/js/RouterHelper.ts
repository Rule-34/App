import Tag from 'assets/js/tag.dto'
import { RouteLocationRaw } from 'vue-router'

export function generatePostsRoute(domain?: string, page?: number, tags?: Tag[]) {
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

  return route
}
