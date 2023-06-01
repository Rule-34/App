import { useStorage } from '@vueuse/core'

const timesTheAppHasBeenOpened = useStorage('statistics-timesTheAppHasBeenOpened', 1, localStorage)

// Add one to the timesTheAppHasBeenOpened
timesTheAppHasBeenOpened.value++

export function useAppStatistics() {
  return reactive({
    timesTheAppHasBeenOpened
  })
}