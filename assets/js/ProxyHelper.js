'use strict'

const config = useRuntimeConfig()

export class ProxyHelper {
  /**
   * @param {string} url
   *
   * @return string
   */
  static proxyUrl(url) {
    return config.public.PROXY_URL + encodeURIComponent(url)
  }
}
