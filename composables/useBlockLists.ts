import { useLocalStorage } from '@vueuse/core'

const defaultBlockList: readonly string[] = Object.freeze([
  //
  'loli',
  'shota'
  //
  // 'gore',
  // 'guro',
  //
  // 'scat',
  //
  // 'vore'
])

const aiBlockList: readonly string[] = Object.freeze(['ai_generated', 'ai-generated', 'AI-generated'])

export enum blockListOptions {
  Default = 'default',
  Custom = 'custom',
  None = 'none'
}

export default function () {
  const { blockAiGeneratedImages } = useUserSettings()

  let customBlockList = ref<string[]>([])

  let selectedList = ref<blockListOptions>(blockListOptions.None)

  if (import.meta.client) {
    customBlockList = useLocalStorage('user-customBlocklist', [], {
      writeDefaults: false
    })

    selectedList = useLocalStorage<blockListOptions>('user-selectedList', blockListOptions.None, {
      writeDefaults: false
    })
  }

  return {
    selectedList,
    selectedBlockList: computed(() => {
      let list: string[] = []

      switch (selectedList.value) {
        case 'default':
          list = [...defaultBlockList]
          break

        case 'custom':
          list = [...customBlockList.value]
          break

        default:
          list = []
          break
      }

      if (blockAiGeneratedImages.value) {
        list.push(...aiBlockList)
      }

      return [...new Set(list)]
    }),

    defaultBlockList,
    customBlockList,

    resetCustomBlockList() {
      customBlockList.value = []
    }
  }
}
