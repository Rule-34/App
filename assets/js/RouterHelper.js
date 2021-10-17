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

    if (domain !== undefined) {
      route.query.domain = domain
    }

    if (page !== undefined) {
      route.query.page = page
    }

    // Fix: separate tags by commas instead of repeating `tags`, like so: `&tags=example1&tags=example2`
    if (tags.length) {
      route.query.tags = tags.join(',')
    }

    return route
  }
}
