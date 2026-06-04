import { cloneDeep } from 'es-toolkit'
import type { TagCollection } from '~/assets/js/tagCollection.dto'
import type { Composer } from 'vue-i18n'

export default function () {
  const $i18n = useNuxtApp().$i18n as Composer

  const defaultTagCollections: TagCollection[] = [
    {
      name: $i18n.t('pages.premium.tagCollectionsPage.defaultAnimated'),
      tags: ['animated']
    },
    {
      name: $i18n.t('pages.premium.tagCollectionsPage.defaultVideosWithSound'),
      tags: ['video', 'sound']
    },
    {
      name: $i18n.t('pages.premium.tagCollectionsPage.defaultLongVideosWithSound'),
      tags: ['video', 'sound', 'longer_than_30_seconds']
    }
  ]

  const tagCollections = useState<TagCollection[]>('premium-tag-collections', () => cloneDeep(defaultTagCollections))

  return {
    tagCollections,

    resetTagCollections() {
      tagCollections.value = cloneDeep(defaultTagCollections)
    }
  }
}
