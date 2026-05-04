import { useLocalStorage } from '@vueuse/core'

interface PageHistory {
  path: string

  date: Date
}

export default function () {
  const router = useRouter()
  const getRouteBaseName = useRouteBaseName()

  let pageHistory = ref<PageHistory[]>([])

  function isPostsPage(relativeUrl: string) {
    return getRouteBaseName(router.resolve(relativeUrl)) === 'posts-domain'
  }

  function getComparableUrlWithoutPage(relativeUrl: string) {
    const url = new URL(relativeUrl, window.location.origin)

    url.searchParams.delete('page')

    // Keep query-order differences from creating duplicate history entries.
    const sortedParams = new URLSearchParams(Array.from(url.searchParams.entries()).sort(([a], [b]) => a.localeCompare(b)))
    const search = sortedParams.toString()

    return search ? `${url.pathname}?${search}` : url.pathname
  }

  // TODO: Serialize Date
  if (import.meta.client) {
    pageHistory = useLocalStorage<PageHistory[]>('settings-pageHistory', [], {
      writeDefaults: false
    })
  }

  /**
   * Adds a relative URL to the page history
   * With a maximum of 10 pages
   */
  function addUrlToPageHistory(relativeUrl: string) {
    if (import.meta.server) {
      throw new Error('This should only be called on the client')
    }

    if (!isPostsPage(relativeUrl)) {
      return
    }

    const url = new URL(relativeUrl, window.location.origin)

    // Skip if there are no query params
    if (!url.search) {
      return
    }

    const previousPage = pageHistory.value[pageHistory.value.length - 1]
    const comparableUrl = getComparableUrlWithoutPage(relativeUrl)

    // Skip if the previous url is the same
    if (previousPage && previousPage.path === relativeUrl) {
      return
    }

    // Keep the latest page for the same path/query (ignoring only page).
    pageHistory.value = pageHistory.value.filter((page) => getComparableUrlWithoutPage(page.path) !== comparableUrl)

    // Maximum of 10 pages
    if (pageHistory.value.length >= 10) {
      pageHistory.value.shift()
    }

    pageHistory.value.push({
      path: relativeUrl,
      date: new Date()
    })

    // TODO: Remove duplicated paths, while keeping the most recent
    // pageHistory.value = pageHistory.value.filter((page, index, self) => {
    //
    //   return self.findIndex((p) => p.path === page.path) === index
    // })
  }

  return {
    pageHistory,
    addUrlToPageHistory
  }
}
