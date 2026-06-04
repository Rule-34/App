import { booruTypeList, completeBooruList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import type { Domain } from '~/assets/js/domain'

const defaultBooruList: Domain[] = completeBooruList
  // Disable specific Booru sites
  .filter((booruObj) => {
    const disabledDomains = [
      //
      'realbooru.com',
      'konachan.com',
      'booru.allthefallen.moe',
      'sakugabooru.com'
    ]

    return !disabledDomains.includes(booruObj.domain)
  })
  .map((booruObj, index) => {
    const booruType = booruTypeList.find((booruTypeObj) => booruTypeObj.type === booruObj.type)

    if (!booruType) throw new Error(`Booru type not found: ${booruObj.type}`)

    return {
      domain: booruObj.domain,

      type: booruType,

      config: booruObj.config,

      // The first 6 boorus are free
      isPremium: index > 5,
      isCustom: false
    } as Domain
  })

export default function () {
  const userBooruList = useState<Domain[]>('premium-user-booru-list', () => [])

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
