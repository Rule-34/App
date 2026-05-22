import Tag from './tag.dto'
import type { LocationQuery, LocationQueryRaw, RouteLocationRaw } from 'vue-router'

export const fallbackBooruDomain = 'rule34.xxx'

const facetedTagPrefixes = new Set([
  'date',
  'height',
  'id',
  'limit',
  'mpixels',
  'order',
  'parent',
  'rating',
  'score',
  'sort',
  'source',
  'user',
  'width'
])

export function generatePostsRoute(
  path: string = '/posts',
  domain?: string | undefined | null,
  page?: number | undefined | null,
  tags?: Tag[] | undefined | null,
  filters?: Record<string, unknown> | undefined | null
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
    assignFilterQuery(route.query, filters)
  }

  return route
}

export function generatePostTagLandingPath(domain: string, tag: string, basePath: string = '/posts') {
  return `${basePath}/${domain}/${encodeURIComponent(tag)}`
}

export function getSinglePositiveTagQueryValue(value: string | string[] | null | (string | null)[] | undefined) {
  if (Array.isArray(value) && value.length !== 1) {
    return undefined
  }

  const tag = getSingleQueryValue(value)

  const tagPrefix = tag.split(':', 1)[0]

  if (!tag || tag.startsWith('-') || tag.includes('|') || /\s/.test(tag) || facetedTagPrefixes.has(tagPrefix)) {
    return undefined
  }

  return tag
}

export function getFilterQueryValue(query: LocationQuery, key: string) {
  const nestedFilter = query.filter

  if (nestedFilter && typeof nestedFilter === 'object' && !Array.isArray(nestedFilter)) {
    return getSingleQueryValue((nestedFilter as LocationQuery)[key])
  }

  return getSingleQueryValue(query[`filter[${key}]`])
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

function assignFilterQuery(query: LocationQueryRaw, filters: Record<string, unknown>) {
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined) {
      continue
    }

    query[`filter[${key}]`] = value as LocationQueryRaw[string]
  }
}

function isObjectEmpty(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}
