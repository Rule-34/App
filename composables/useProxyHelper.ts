export function useProxyHelper(url: string) {
  const PROXY_URL = 'https://cors-proxy.r34.app/?q='

  const proxiedUrl = computed(() => PROXY_URL + encodeURIComponent(url))

  return {
    proxiedUrl
  }
}
