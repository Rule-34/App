import { useLocalStorage } from '@vueuse/core'

interface PageHistory {
  path: string

  date: Date
}

/**
 * Checks if the relative URL is the previous page
 */
function isUrlPreviousPage(url1: string, url2: string): boolean {
  if (!url1 || !url2) {
    return false
  }

  const url1WithoutPage = new URL(url1, window.location.origin)
  const url1Page = url1WithoutPage.searchParams.get('page')
  url1WithoutPage.searchParams.delete('page')

  const url2WithoutPage = new URL(url2, window.location.origin)
  const url2Page = url2WithoutPage.searchParams.get('page')
  url2WithoutPage.searchParams.delete('page')

  const isSameUrlWithoutPage = url1WithoutPage.href === url2WithoutPage.href
  const isPreviousPage = url2Page === String(Number(url1Page) - 1)

  return isSameUrlWithoutPage && isPreviousPage
}

export default function () {
  let pageHistory = ref<PageHistory[]>([])

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
    if (process.server) {
      throw new Error('This should only be called on the client')
    }

    const url = new URL(relativeUrl, window.location.origin)

    // Skip if it's not the posts path
    if (!url.pathname.startsWith('/posts/')) {
      return
    }

    // Skip if there are no query params
    if (!url.search) {
      return
    }

    const previousPage = pageHistory.value[pageHistory.value.length - 1]

    // Skip if the previous url is the same
    if (previousPage && previousPage.path === relativeUrl) {
      return
    }

    // Replace if the previous url is the previous page before current page
    if (previousPage && isUrlPreviousPage(relativeUrl, previousPage.path)) {
      pageHistory.value.pop()
    }

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
