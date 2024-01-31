import { booruTypeList, completeBooruList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import { useStorage } from '@vueuse/core'
import type { Domain } from '~/assets/js/domain'

const defaultBooruList: Domain[] = completeBooruList.map((booruObj, index) => {
  const booruType = booruTypeList.find((booruTypeObj) => booruTypeObj.type === booruObj.type)

  if (!booruType) throw new Error(`Booru type not found: ${booruObj.type}`)

  return {
    domain: booruObj.domain,

    type: booruType,

    config: booruObj.config,

    // The first 7 boorus are free
    isPremium: index > 6,
    isCustom: false
  } as Domain
})

let userBooruList = ref<Domain[]>([])

if (process.client) {
  userBooruList = useStorage<Domain[]>('user-booruList-2', [], localStorage, {
    writeDefaults: false
  })
}

export function useBooruList() {
  return {
    booruList: computed(() => {
      return [...defaultBooruList, ...userBooruList.value]
    }),

    defaultBooruList,

    userBooruList,

    resetUserBooruList() {
      userBooruList.value = []
    }
  }
}
