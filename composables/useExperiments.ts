import { useStorage } from '@vueuse/core'

let experimentPrice = ref<number>(4.9)

if (process.client) {
  experimentPrice = useStorage('experiment-price', 4.9, sessionStorage, {
    writeDefaults: false
  })
}

export function useExperiments() {

  return {
    experimentPrice,
  }
}
