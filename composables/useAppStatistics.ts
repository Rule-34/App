import { useStorage } from '@vueuse/core'

let timesTheAppHasBeenOpened = ref<number>(0)

let tutorialLongClickTag = ref<boolean>(false)

let tutorialSavePost = ref<boolean>(false)

if (process.client) {
  timesTheAppHasBeenOpened = useStorage('statistics-appOpenedCount', 0, localStorage, {
    writeDefaults: false
  })

  tutorialLongClickTag = useStorage('tutorial-longClickTag', false, localStorage, {
    writeDefaults: false
  })

  tutorialSavePost = useStorage('tutorial-savePost', false, localStorage, {
    writeDefaults: false
  })
}

timesTheAppHasBeenOpened.value++

export function useAppStatistics() {
  return {
    timesTheAppHasBeenOpened,

    tutorialLongClickTag,
    tutorialSavePost
  }
}
