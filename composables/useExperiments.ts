import { useSessionStorage } from '@vueuse/core'

export default function () {
  let experimentPriceCurrency = ref('$')

  if (import.meta.client) {
    experimentPriceCurrency = useSessionStorage('experiment-price', '$', {
      writeDefaults: false
    })
  }

  return {
    experimentPriceCurrency
  }
}
