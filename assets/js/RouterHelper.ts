import type { ITag } from './tag.dto'
import type { LocationQueryValue, LocationQueryValueRaw, RouteLocationRaw } from 'vue-router'

export function generatePostsRoute(
  path: string = '/posts',
  domain?: string | undefined | null,
  page?: number | undefined | null,
  tags?: ITag[] | undefined | null,
  filters?: Object | undefined | null
) {
  const query: Record<string, unknown> = {}

  const route: RouteLocationRaw = {
    path,
    query
  }

  if (domain != null) {
    route.path = `${path}/${domain}`
  }

  if (page != null) {
    query.page = page.toString()
  }

  const serializedTags = serializeRouteTags(tags)

  if (serializedTags) {
    query.tags = serializedTags
  }

  // Check if object keys are not undefined
  if (filters != null && !isObjectEmpty(filters)) {
    query.filter = filters
  }

  return route
}

export function serializeRouteTags(tags?: ITag[] | undefined | null): LocationQueryValueRaw[] | undefined {
  if (!Array.isArray(tags) || tags.length === 0) {
    return undefined
  }

  return tags.map((tag) => encodeURIComponent(tag.name))
}

export function parseRouteTags(tags?: LocationQueryValue | LocationQueryValue[] | null): ITag[] {
  const normalizedTags = Array.isArray(tags)
    ? tags.filter((tag): tag is string => tag != null)
    : tags != null
      ? [tags]
      : []

  return normalizedTags
    .map((tag) => decodeURIComponent(tag))
    .filter(Boolean)
    .map((tag) => ({ name: tag }))
}

function isObjectEmpty(obj: object) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}
