export class RouterHelper {
  /**
   * @param {string} [domain]
   * @param {number} [page]
   * @param {string[]} [tags]
   */
  static generatePostsRoute(domain, page, tags) {
    const route = {
      path: '/',
      query: {}
    }

    if (domain != null) {
      route.query.domain = domain
    }

    if (page != null) {
      route.query.page = page.toString()
    }

    // Fix: separate tags by commas instead of repeating `tags`, like so: `&tags=example1&tags=example2`
    if (tags != null && Array.isArray(tags) && tags.length) {
      route.query.tags = tags.map((tag) => encodeURI(tag)).join('|')
    }

    return route
  }

  /**
   * @param {Store<*> | boolean | ((typedArray: (Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array), index: number, value: number) => number) | ((credential: Credential) => Promise<Credential>) | ((typedArray: (BigInt64Array | BigUint64Array), index: number, value: bigint) => bigint)} store
   * @param {string} [domain]
   * @param {number} [page]
   * @param {string[]} [tags]
   */
  static generatePostsRouteWithDefaults(store, domain, page, tags) {
    const STORE_GETTER = store.rootGetters ?? store.getters

    if (domain == null) {
      domain = STORE_GETTER['booru/getActiveBooru'].domain
    }

    if (page == null) {
      page = STORE_GETTER['booru/getActiveBooruType'].initialPageID
    }

    return RouterHelper.generatePostsRoute(domain, page, tags)
  }

  /**
   * @param {Store<*> | boolean | ((typedArray: (Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array), index: number, value: number) => number) | ((credential: Credential) => Promise<Credential>) | ((typedArray: (BigInt64Array | BigUint64Array), index: number, value: bigint) => bigint)} store
   * @param {string} [domain]
   * @param {number} [page]
   * @param {string[]} [tags]
   */
  static generatePostsRouteWithActiveDefaults(store, domain, page, tags) {
    const STORE_GETTER = store.rootGetters ?? store.getters

    if (domain == null) {
      domain = STORE_GETTER['booru/getActiveBooru'].domain
    }

    if (page == null) {
      page = STORE_GETTER['booru/getPageID']
    }

    if (tags == null) {
      tags = STORE_GETTER['booru/getTags']
    }

    return RouterHelper.generatePostsRoute(domain, page, tags)
  }
}
