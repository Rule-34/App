import { useLocalStorage } from '@vueuse/core'
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

export default function () {
  let tagCollections = ref<TagCollection[]>(cloneDeep(defaultTagCollections))

  onMounted(() => {
    tagCollections = useLocalStorage('user-tagCollections', cloneDeep(defaultTagCollections), {
      writeDefaults: false
    })
  })

  return {
    tagCollections,

    resetTagCollections() {
      tagCollections.value = cloneDeep(defaultTagCollections)
    }
  }
}
