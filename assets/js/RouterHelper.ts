import Tag from './tag.dto'
import type { RouteLocationRaw } from 'vue-router'

export const fallbackBooruDomain = 'rule34.xxx'

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
    route.query.tags = tags.map((tag) => tag.name).join('|')
  }

  // Check if object keys are not undefined
  if (filters != null && !isObjectEmpty(filters)) {
    route.query.filter = filters
  }

  return route
}

export function getSingleQueryValue(value: string | string[] | null | (string | null)[] | undefined) {
  if (Array.isArray(value)) {
    const firstValue = value[0]

    return firstValue ?? undefined
  }

  if (value === null || value === undefined) {
    return undefined
  }

  return value
}

function isObjectEmpty(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}
