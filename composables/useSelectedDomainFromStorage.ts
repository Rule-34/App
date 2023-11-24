import { useStorage } from '@vueuse/core'

let selectedBooru = ref<string | undefined>(undefined)

if (process.client) {
  selectedBooru = useStorage<string | undefined>('user-selectedBooru', undefined, localStorage, {
    writeDefaults: false
  })
}

export function useSelectedDomainFromStorage() {
  return {
    selectedDomainFromStorage: selectedBooru
  }
}
