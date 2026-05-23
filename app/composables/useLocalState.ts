import { useLocalStorage } from '@vueuse/core'

export function useLocalState<T>(key: string, initialValue: T) {
  const state = useState<T>(key, () => initialValue)
  const isStateHydrated = useState<boolean>(`${key}-is-hydrated`, () => false)

  const localStorage = useLocalStorage(key, initialValue, {
    writeDefaults: false,
    listenToStorageChanges: false
  })

  // Set state from localStorage
  const hasStoredValue = import.meta.client && globalThis.localStorage.getItem(key) !== null

  if (
    //
    import.meta.client &&
    !isStateHydrated.value &&
    hasStoredValue
  ) {
    state.value = localStorage.value

    isStateHydrated.value = true
  }

  // Watch state and update localStorage if it changes
  // TODO: optimally, only one watch should be used for any number of useLocalState calls
  watch(state, (newValue) => {
    localStorage.value = newValue
  })

  return state
}
