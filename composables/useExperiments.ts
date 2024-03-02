import { useStorage } from '@vueuse/core'

let experimentPriceCurrency = ref('€')

if (process.client) {
  experimentPriceCurrency = useStorage('experiment-price', '€', sessionStorage, {
    writeDefaults: false
  })
}

export function useExperiments() {

  return {
    experimentPriceCurrency,
  }
}
