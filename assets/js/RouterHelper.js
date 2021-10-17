export class RouterHelper {
  /**
   * @param {string} [domain]
   * @param {number} [page]
   * @param {string[]} [tags]
   */
  static generatePostsRoute(domain, page, tags) {
    const route = {
      path: '/',
      query: {},
    }

    if (domain != null) {
      route.query.domain = domain
    }

    if (page != null) {
      route.query.page = page.toString()
    }

    // Fix: separate tags by commas instead of repeating `tags`, like so: `&tags=example1&tags=example2`
    if (tags != null && Array.isArray(tags) && tags.length) {
      route.query.tags = tags.join(',')
    }

    return route
  }
}
