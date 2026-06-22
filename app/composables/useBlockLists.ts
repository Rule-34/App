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

  const customBlockList = useState<string[]>('premium-custom-block-list', () => [])

  let selectedList = ref<blockListOptions>(blockListOptions.None)

  if (import.meta.client) {
    selectedList = useLocalStorage<blockListOptions>('user-selectedList', blockListOptions.None, {
      writeDefaults: false
    })
  }

  return {
    selectedList,
    selectedBlockList: computed(() => {
      const list =
        selectedList.value === blockListOptions.Default
          ? [...defaultBlockList]
          : selectedList.value === blockListOptions.Custom
            ? [...customBlockList.value]
            : []

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
