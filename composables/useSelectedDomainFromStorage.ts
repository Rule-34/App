import { useStorage } from '@vueuse/core'

const selectedBooru: Ref<string | undefined> = useStorage('user-selectedBooru', undefined, localStorage, {
  writeDefaults: false
})

export function useSelectedDomainFromStorage() {
  return {
    selectedDomainFromStorage: selectedBooru
  }
}
