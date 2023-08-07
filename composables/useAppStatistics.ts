import { useStorage } from '@vueuse/core'

const timesTheAppHasBeenOpened = useStorage('statistics-appOpenedCount', 0, localStorage, {
  writeDefaults: false
})

const tutorialLongClickTag = useStorage('tutorial-longClickTag', false, localStorage, {
  writeDefaults: false
})

// Add one to the timesTheAppHasBeenOpened
timesTheAppHasBeenOpened.value++

export function useAppStatistics() {
  return {
    timesTheAppHasBeenOpened,

    tutorialLongClickTag
  }
}
