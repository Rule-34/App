import { useSessionStorage } from '@vueuse/core'

export default function () {
  let experimentPriceCurrency = ref('$')

  onMounted(() => {
    experimentPriceCurrency = useSessionStorage('experiment-price', '$', {
      writeDefaults: false
    })
  })

  return {
    experimentPriceCurrency
  }
}
