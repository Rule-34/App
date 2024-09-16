import { useLocalStorage } from '@vueuse/core'

export default function () {
  let selectedBooru = ref<string | undefined>(undefined)

  onMounted(() => {
    selectedBooru = useLocalStorage<string | undefined>('user-selectedBooru', undefined, {
      writeDefaults: false
    })
  })

  return {
    selectedDomainFromStorage: selectedBooru
  }
}
