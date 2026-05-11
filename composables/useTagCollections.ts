import { useLocalStorage } from '@vueuse/core'
import { cloneDeep } from 'es-toolkit'
import { TagCollection } from '~/assets/js/tagCollection.dto'

export default function () {
  const { t } = useI18n()

  const defaultTagCollections: TagCollection[] = [
    {
      name: t('pages.premium.tagCollectionsPage.defaultAnimated'),
      tags: ['animated']
    },
    {
      name: t('pages.premium.tagCollectionsPage.defaultVideosWithSound'),
      tags: ['video', 'sound']
    },
    {
      name: t('pages.premium.tagCollectionsPage.defaultLongVideosWithSound'),
      tags: ['video', 'sound', 'longer_than_30_seconds']
    }
  ]

  let tagCollections = ref<TagCollection[]>(cloneDeep(defaultTagCollections))

  if (import.meta.client) {
    tagCollections = useLocalStorage('user-tagCollections', cloneDeep(defaultTagCollections), {
      writeDefaults: false
    })
  }

  return {
    tagCollections,

    resetTagCollections() {
      tagCollections.value = cloneDeep(defaultTagCollections)
    }
  }
}
