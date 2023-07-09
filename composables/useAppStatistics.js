import { useStorage } from '@vueuse/core'

const timesTheAppHasBeenOpened = useStorage('statistics-appOpenedCount', 0, localStorage, {
  writeDefaults: false
})

const feedbackButtonClosedCount = useStorage('statistics-feedbackButtonClosedCount', 0, localStorage, {
  writeDefaults: false
})

// Add one to the timesTheAppHasBeenOpened
timesTheAppHasBeenOpened.value++

export function useAppStatistics() {
  return {
    timesTheAppHasBeenOpened,

    feedbackButtonClosedCount
  }
}
