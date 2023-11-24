import { booruTypeList, completeBooruList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import { useStorage } from '@vueuse/core'
import type { Domain } from '~/assets/js/domain'
import { cloneDeep } from 'lodash-es'

const defaultBooruList: Domain[] = completeBooruList.map((booruObj, index) => {
  const booruType = booruTypeList.find((booruTypeObj) => booruTypeObj.type === booruObj.type)

  if (!booruType) throw new Error(`Booru type not found: ${booruObj.type}`)

  return {
    domain: booruObj.domain,

    type: booruType,

    config: booruObj.config,

    // The first 7 boorus are free
    isPremium: index > 6
  } as Domain
})

let userBooruList = ref<Domain[]>(cloneDeep(defaultBooruList))

if (process.client) {
  userBooruList = useStorage<Domain[]>('user-booruList', cloneDeep(defaultBooruList), localStorage, {
    writeDefaults: false
  })
}

export function useBooruList() {
  return {
    booruList: userBooruList,

    resetBooruList() {
      userBooruList.value = cloneDeep(defaultBooruList)
    }
  }
}
