import { useLocalStorage } from '@vueuse/core'

export function useLocalState<T>(key: string, initialValue: T) {
  const state = useState<T>(key, () => initialValue)
  const isStateHydrated = useState<boolean>(`${key}-is-hydrated`, () => false)

  const localStorage = useLocalStorage(key, initialValue, {
    writeDefaults: false,
    listenToStorageChanges: false
  })

  // Set state from localStorage
  if (
    //
    import.meta.client &&
    !isStateHydrated.value &&
    localStorage.value !== null
  ) {
    state.value = localStorage.value

    isStateHydrated.value = true
  }

  // Watch state and update localStorage if it changes
  // TODO: optimally, only one watch should be used for any number of useLocalState calls
  watch(state, (newValue, oldValue) => {
    localStorage.value = newValue
  })

  return state
}
