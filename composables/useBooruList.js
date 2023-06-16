import { booruTypeList, completeBooruList } from 'assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import { useStorage } from '@vueuse/core'

const { isPremium } = useUserData()

const userBooruList = useStorage('user-booruList', [], localStorage, {
  writeDefaults: false
})

const defaultBooruList = [
  {
    // rule34.xxx
    domain: completeBooruList[0].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[0].type),
    // Moderation is the quality of the posts, if it's a shitpost, or only high quality posts
    // Assign a value from 1 to 5 for each category
    description: {
      posts_count: 7_000_000,
      tag_system: 4,
      post_moderation: 4,
      content_variety: 3,
      load_speed: 4,
      api_compatibility: 4,

      score: null,

      note: null
    },
    disabled: false
  },
  {
    // rule34.paheal.net
    domain: completeBooruList[1].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[1].type),
    description: {
      posts_count: 5_000_000,
      tag_system: 1,
      post_moderation: 3,
      content_variety: 4,
      load_speed: 2,
      api_compatibility: 2,

      score: null,

      note: null
    },
    disabled: false
  },
  {
    // danbooru.donmai.us
    domain: completeBooruList[2].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[2].type),
    description: {
      posts_count: 5_000_000,
      tag_system: 5,
      post_moderation: 4,
      content_variety: 4,
      load_speed: 4,
      api_compatibility: 5,

      score: null,

      note: null
    },
    disabled: false
  },
  {
    // safebooru.org
    domain: completeBooruList[4].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[4].type),
    description: {
      posts_count: 4_000_000,
      tag_system: 4,
      post_moderation: 4,
      content_variety: 2,
      load_speed: 4,
      api_compatibility: 3,

      score: null,

      note: 'Only safe content'
    },
    disabled: false
  },
  {
    // gelbooru.com
    domain: completeBooruList[3].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[3].type),
    description: {
      posts_count: 8_000_000,
      tag_system: 4,
      post_moderation: 4,
      content_variety: 5,
      load_speed: 4,
      api_compatibility: 4,

      score: null,

      note: null
    },
    disabled: false
  },
  {
    // e621.net
    domain: completeBooruList[5].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[5].type),
    description: {
      posts_count: 4_000_000,
      tag_system: 5,
      post_moderation: 4,
      content_variety: 2,
      load_speed: 4,
      api_compatibility: 5,

      score: null,

      note: 'Only furry content'
    },
    disabled: false
  },
  {
    // e926.net
    domain: completeBooruList[6].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[6].type),
    description: {
      posts_count: 800_000,
      tag_system: 5,
      post_moderation: 4,
      content_variety: 2,
      load_speed: 4,
      api_compatibility: 5,

      score: null,

      note: 'Only safe furry content'
    },
    disabled: false
  },
  // hypnohub.net
  {
    // yande.re
    domain: completeBooruList[9].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[9].type),
    description: {
      posts_count: 1_000_000,
      tag_system: 2,
      post_moderation: 4,
      content_variety: 3,
      load_speed: 4,
      api_compatibility: 4,

      score: null,

      note: null
    },
    disabled: false
  },
  {
    // konachan.com
    domain: completeBooruList[10].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[10].type),
    description: {
      posts_count: 300_000,
      tag_system: 2,
      post_moderation: 4,
      content_variety: 3,
      load_speed: 4,
      api_compatibility: 4,

      score: null,

      note: null
    },
    disabled: false
  },
  {
    // xbooru.com
    domain: completeBooruList[7].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[7].type),
    description: {
      posts_count: 600_000,
      tag_system: 3,
      post_moderation: 3,
      content_variety: 3,
      load_speed: 4,
      api_compatibility: 2,

      score: null,

      note: null
    },
    disabled: false
  },
  {
    // lolibooru.moe
    domain: completeBooruList[11].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[11].type),
    description: {
      posts_count: 600_000,
      tag_system: 5,
      post_moderation: 4,
      content_variety: 3,
      load_speed: 4,
      api_compatibility: 4,

      score: null,

      note: 'Only lolicon content'
    },
    disabled: false
  },
  {
    // booru.allthefallen.moe
    domain: completeBooruList[12].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[12].type),
    description: {
      posts_count: 400_000,
      tag_system: 4,
      post_moderation: 4,
      content_variety: 4,
      load_speed: 3,
      api_compatibility: 4,

      score: null,

      note: 'Only lolicon content'
    },
    disabled: false
  },
  {
    // realbooru.com
    domain: completeBooruList[13].domain,
    type: booruTypeList.find((booruType) => booruType.type === completeBooruList[13].type),
    description: {
      posts_count: 800_000,
      tag_system: 3,
      post_moderation: 3,
      content_variety: 3,
      load_speed: 3,
      api_compatibility: 2,

      score: null,

      note: 'Only real life content'
    },
    disabled: false
  }
]

defaultBooruList.forEach((booru) => {
  let totalScore = 0

  switch (true) {
    case booru.description.posts_count <= 100_000:
      totalScore += 1
      break

    case booru.description.posts_count > 100_000 && booru.description.posts_count <= 300_000:
      totalScore += 2
      break

    case booru.description.posts_count > 300_000 && booru.description.posts_count <= 600_000:
      totalScore += 3
      break

    case booru.description.posts_count > 600_000 && booru.description.posts_count <= 1_000_000:
      totalScore += 4
      break

    case booru.description.posts_count > 1_000_000:
      totalScore += 5
      break
  }

  totalScore += booru.description.tag_system
  totalScore += booru.description.post_moderation
  totalScore += booru.description.content_variety
  totalScore += booru.description.load_speed
  totalScore += booru.description.api_compatibility

  booru.description.score = (totalScore / 6).toFixed(1)
})

// Object.freeze(defaultBooruList)

export function useBooruList() {
  const mergedBooruList = computed(() => {
    const booruList = [...defaultBooruList, ...userBooruList.value]

    // Disable boorus from index 7 if user is not Premium
    booruList.forEach((booru, index) => {
      if (index >= 7 && !isPremium.value) {
        booru.disabled = true
      }
    })

    return booruList
  })

  return {
    booruList: mergedBooruList
  }
}
