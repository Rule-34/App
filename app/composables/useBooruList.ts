import {
  booruTypeList,
  completeBooruList,
  defaultBooruList as sharedDefaultBooruList
} from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import type { Domain } from '~/assets/js/domain'

const disabledDomains = new Set(['realbooru.com', 'konachan.com', 'booru.allthefallen.moe', 'sakugabooru.com'])

export const appDefaultBooruList: Domain[] = completeBooruList
  .filter((booruObj) => !disabledDomains.has(booruObj.domain))
  .map((booruObj) => {
    const booruType = booruTypeList.find((booruTypeObj) => booruTypeObj.type === booruObj.type)

    if (!booruType) throw new Error(`Booru type not found: ${booruObj.type}`)

    return {
      domain: booruObj.domain,

      type: booruType,

      config: booruObj.config,

      isPremium: !sharedDefaultBooruList.some((defaultObj) => defaultObj.domain === booruObj.domain),
      isCustom: false
    } as Domain
  })

export default function () {
  const userBooruList = useState<Domain[]>('premium-user-booru-list', () => [])

  return {
    booruList: computed(() => {
      return [...appDefaultBooruList, ...userBooruList.value]
    }),

    defaultBooruList: appDefaultBooruList,

    userBooruList,

    resetUserBooruList() {
      userBooruList.value = []
    }
  }
}
