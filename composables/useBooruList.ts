import { booruTypeList, completeBooruList } from 'assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import { useStorage } from '@vueuse/core'
import type { Domain } from 'assets/js/domain'

const defaultBooruList: Domain[] = [
  {
    // rule34.xxx
    domain: completeBooruList[0].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[0].type),
    isPremium: false
  },
  {
    // rule34.paheal.net
    domain: completeBooruList[1].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[1].type),
    isPremium: false
  },
  {
    // danbooru.donmai.us
    domain: completeBooruList[2].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[2].type),
    isPremium: false
  },
  {
    // safebooru.org
    domain: completeBooruList[4].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[4].type),
    isPremium: false
  },
  {
    // gelbooru.com
    domain: completeBooruList[3].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[3].type),
    isPremium: false
  },
  {
    // e621.net
    domain: completeBooruList[5].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[5].type),
    isPremium: false
  },
  {
    // e926.net
    domain: completeBooruList[6].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[6].type),
    isPremium: false
  },
  {
    // yande.re
    domain: completeBooruList[9].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[9].type),
    isPremium: true
  },
  {
    // konachan.com
    domain: completeBooruList[10].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[10].type),
    isPremium: true
  },
  {
    // xbooru.com
    domain: completeBooruList[7].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[7].type),
    isPremium: true
  },
  {
    // lolibooru.moe
    domain: completeBooruList[11].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[11].type),
    isPremium: true
  },
  {
    // booru.allthefallen.moe
    domain: completeBooruList[12].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[12].type),
    isPremium: true
  },
  {
    // realbooru.com
    domain: completeBooruList[13].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[13].type),
    isPremium: true
  }
]

const userBooruList = useStorage('user-booruList', defaultBooruList, localStorage, {
  writeDefaults: false
})

export function useBooruList() {
  return {
    booruList: userBooruList,

    resetBooruList() {
      userBooruList.value = defaultBooruList
    }
  }
}
