import { useLocalStorage } from '@vueuse/core'

export function useLocalState<T>(key: string, initialValue: T) {
  const state = useState<T>(key, () => initialValue)

  const localStorage = useLocalStorage(key, initialValue, {
    writeDefaults: false,
    listenToStorageChanges: false
  })

  onMounted(() => {
    if (localStorage.value === null) {
      return
    }

    state.value = localStorage.value
  })

  watch(state, (newValue, oldValue) => {
    localStorage.value = newValue
  })

  return state
}
