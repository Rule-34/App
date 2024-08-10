import { useStorage } from '@vueuse/core'

let timesTheAppHasBeenOpened = ref<number>(0)

let tutorialPostSource = ref<boolean>(false)

let promptInstallPwa = ref<boolean>(false)
let promptFeedback = ref<boolean>(false)
let promptReview = ref<boolean>(false)

if (process.client) {
  timesTheAppHasBeenOpened = useStorage('statistics-appOpenedCount', 0, localStorage, {
    writeDefaults: false
  })

  tutorialPostSource = useStorage('tutorial-postSource', false, localStorage, {
    writeDefaults: false
  })

  promptInstallPwa = useStorage('prompt-installPwa', false, localStorage, {
    writeDefaults: false
  })
  promptFeedback = useStorage('prompt-feedback', false, localStorage, {
    writeDefaults: false
  })
  promptReview = useStorage('prompt-review', false, localStorage, {
    writeDefaults: false
  })
}

timesTheAppHasBeenOpened.value++

export function useAppStatistics() {
  return {
    timesTheAppHasBeenOpened,

    tutorialPostSource,

    promptInstallPwa,
    promptFeedback,
    promptReview
  }
}
