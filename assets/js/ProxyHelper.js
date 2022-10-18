'use strict'

export class ProxyHelper {
  /**
   * @param {string} url
   *
   * @return string
   */
  static proxyUrl(url) {
    return window.$nuxt.$config.PROXY_URL + encodeURIComponent(url)
  }
}
