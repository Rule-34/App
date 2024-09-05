import { useStorage } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'
import { TagCollection } from '~/assets/js/tagCollection.dto'

const defaultTagCollections: TagCollection[] = [
  {
    name: 'Animated (video or GIFs)',
    tags: ['animated']
  },
  {
    name: 'Videos with sound',
    tags: ['video', 'sound']
  },
  {
    name: 'Long videos with sound',
    tags: ['video', 'sound', 'longer_than_30_seconds']
  }
]

let tagCollections = ref<TagCollection[]>(cloneDeep(defaultTagCollections))

if (process.client) {
  tagCollections = useStorage('user-tagCollections', cloneDeep(defaultTagCollections), localStorage, {
    writeDefaults: false
  })
}

export function useTagCollections() {
  return {
    tagCollections,

    resetTagCollections() {
      tagCollections.value = cloneDeep(defaultTagCollections)
    }
  }
}
