import { useLocalStorage } from '@vueuse/core'

export default function () {
  let timesTheAppHasBeenOpened = ref<number>(0)

  let tutorialPostSource = ref<boolean>(false)

  let promptInstallPwa = ref<boolean>(false)
  let promptFeedback = ref<boolean>(false)
  let promptReview = ref<boolean>(false)

  if (import.meta.client) {
    timesTheAppHasBeenOpened = useLocalStorage('statistics-appOpenedCount', 0, {
      writeDefaults: false
    })

    tutorialPostSource = useLocalStorage('tutorial-postSource', false, {
      writeDefaults: false
    })

    promptInstallPwa = useLocalStorage('prompt-installPwa', false, {
      writeDefaults: false
    })
    promptFeedback = useLocalStorage('prompt-feedback', false, {
      writeDefaults: false
    })
    promptReview = useLocalStorage('prompt-review', false, {
      writeDefaults: false
    })

    callOnce('statistics-appOpenedCount', async () => {
      timesTheAppHasBeenOpened.value++
    })
  }

  return {
    timesTheAppHasBeenOpened,

    tutorialPostSource,

    promptInstallPwa,
    promptFeedback,
    promptReview
  }
}
