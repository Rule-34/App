import { useStorage } from '@vueuse/core'

let timesTheAppHasBeenOpened = ref<number>(0)

let tutorialLongClickTag = ref<boolean>(false)

let tutorialPostSave = ref<boolean>(false)
let tutorialPostSource = ref<boolean>(false)

if (process.client) {
  timesTheAppHasBeenOpened = useStorage('statistics-appOpenedCount', 0, localStorage, {
    writeDefaults: false
  })

  tutorialLongClickTag = useStorage('tutorial-longClickTag', false, localStorage, {
    writeDefaults: false
  })

  tutorialPostSave = useStorage('tutorial-postSave', false, localStorage, {
    writeDefaults: false
  })

  tutorialPostSource = useStorage('tutorial-postSource', false, localStorage, {
    writeDefaults: false
  })
}

timesTheAppHasBeenOpened.value++

export function useAppStatistics() {
  return {
    timesTheAppHasBeenOpened,

    tutorialLongClickTag,
    tutorialPostSave,
    tutorialPostSource
  }
}
