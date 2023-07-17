import { useEventListener, useStorage } from '@vueuse/core'

const route = useRoute()

interface PageHistory {
  path: string

  date: Date
}

const pageHistory = useStorage<PageHistory[]>('settings-pageHistory', [], localStorage, {
  writeDefaults: false
  // TODO: Serialize Date
})

export function usePageHistory() {
  /**
   * Saves the current route full path to the page history
   * With a maximum of 20 pages
   */
  function addListener() {
    useEventListener(document, 'visibilitychange', (event) => {
      if (document.visibilityState !== 'hidden') {
        return
      }

      if (route.path !== '/posts') {
        return
      }

      if (pageHistory.value.length && pageHistory.value[pageHistory.value.length - 1].path === route.fullPath) {
        return
      }

      if (pageHistory.value.length >= 20) {
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