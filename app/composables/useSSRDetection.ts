/**
 * Detects if the CURRENT page was server-side rendered
 *
 * This is useful for optimizing resources only for SSR'd pages (like Googlebot)
 * while avoiding false positives from SPA navigation.
 *
 * @example
 * // Googlebot visits /posts/A?tags=foo directly → wasCurrentPageSSR = true
 * // User lands on / then navigates to /posts/A?tags=foo → wasCurrentPageSSR = false
 * // User lands on /posts/A?tags=foo then navigates to /posts/A?tags=bar → wasCurrentPageSSR = false
 */
export const useSSRDetection = () => {
  // Track which full route (path + query) was initially SSR'd (persists through hydration)
  const ssrRouteFullPath = useState<string | null>('ssrRouteFullPath', () => {
    if (import.meta.server) {
      return useRoute().fullPath
    }
    return null
  })

  const route = useRoute()

  // Check if CURRENT route (including query params) is the one that was SSR'd
  const wasCurrentPageSSR = computed(() => {
    return ssrRouteFullPath.value === route.fullPath
  })

  return {
    wasCurrentPageSSR: readonly(wasCurrentPageSSR)
  }
}
