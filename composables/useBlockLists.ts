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

export enum blockListOptions {
  Default = 'default',
  Custom = 'custom',
  None = 'none'
}

export default function () {
  let customBlockList = ref<string[]>([])

  let selectedList = ref<blockListOptions>(blockListOptions.Default)

  if (import.meta.client) {
    customBlockList = useLocalStorage('user-customBlocklist', [], {
      writeDefaults: false
    })

    selectedList = useLocalStorage<blockListOptions>('user-selectedList', blockListOptions.Default, {
      writeDefaults: false
    })
  }

  return {
    selectedList,
    selectedBlockList: computed(() => {
      switch (selectedList.value) {
        case 'default':
          return defaultBlockList

        case 'custom':
          return customBlockList.value

        default:
          return []
      }
    }),

    defaultBlockList,
    customBlockList,

    resetCustomBlockList() {
      customBlockList.value = []
    }
  }
}
