import { useEventListener, useStorage } from '@vueuse/core'

interface PageHistory {
  path: string

  date: Date
}

let pageHistory = ref<PageHistory[]>([])

if (process.client) {
  pageHistory = useStorage<PageHistory[]>('settings-pageHistory', [], localStorage, {
    writeDefaults: false
  })
  // TODO: Serialize Date
}

export function usePageHistory() {
  const route = useRoute()

  /**
   * Saves the current route full path to the page history
   * With a maximum of 10 pages
   */
  function addListener() {
    if (process.server) {
      return
    }

    useEventListener(document, 'visibilitychange', (event) => {
      if (document.visibilityState !== 'hidden') {
        return
      }

      if (route.path !== '/posts') {
        return
      }

      if (route.fullPath === '/posts') {
        return
      }

      // Skip if the last page is the same
      if (pageHistory.value.length && pageHistory.value[pageHistory.value.length - 1].path === route.fullPath) {
        return
      }

      // TODO: Skip if only domain is set

      if (pageHistory.value.length >= 10) {
        pageHistory.value.shift()
      }

      pageHistory.value.push({
        path: route.fullPath,
        date: new Date()
      })

      // Deduplicate and retain the last duplicate
      pageHistory.value = pageHistory.value.filter((value, index, self) => {
        return self.indexOf(value) === index
      })
    })
  }

  return {
    pageHistory,
    addListener
  }
}
