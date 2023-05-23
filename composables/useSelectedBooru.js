import { useStorage } from '@vueuse/core'

const { booruList } = useBooruList()

const selectedBooru = useStorage('user-selectedBooru', booruList.value[0], localStorage, {
  writeDefaults: false
})

export function useSelectedBooru() {
  return {
    selectedBooru
  }
}
