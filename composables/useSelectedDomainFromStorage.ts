import { useLocalStorage } from '@vueuse/core'

export default function () {
  let selectedBooru = ref<string | undefined>(undefined)

  if (import.meta.client) {
    selectedBooru = useLocalStorage<string | undefined>('user-selectedBooru', undefined, {
      writeDefaults: false
    })
  }

  return {
    selectedDomainFromStorage: selectedBooru
  }
}
