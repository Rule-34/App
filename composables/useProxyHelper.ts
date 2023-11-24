export function useProxyHelper(url: string) {
  const config = useRuntimeConfig()

  const proxiedUrl = computed(() => config.public.PROXY_URL + encodeURIComponent(url))

  return {
    proxiedUrl
  }
}
