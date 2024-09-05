import { useStorage } from '@vueuse/core'

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

let customBlockList = ref<string[]>([])

export enum blockListOptions {
  Default = 'default',
  Custom = 'custom',
  None = 'none'
}

let selectedList = ref<blockListOptions>(blockListOptions.Default)

if (process.client) {
  customBlockList = useStorage('user-customBlocklist', [], localStorage, {
    writeDefaults: false
  })

  selectedList = useStorage<blockListOptions>('user-selectedList', blockListOptions.Default, localStorage, {
    writeDefaults: false
  })
}

export function useBlockLists() {
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
