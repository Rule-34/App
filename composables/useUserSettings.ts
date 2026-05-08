import { useLocalStorage } from '@vueuse/core'

export type PostsLayout = 'list' | 'grid'

export default function () {
  let postFullSizeImages = ref<boolean>(false)
  let postsPerPage = ref<number>(29)
  let postsLayout = ref<PostsLayout>('list')
  let autoplayAnimatedMedia = ref<boolean>(false)
  let blockAiGeneratedImages = ref<boolean>(false)

  if (import.meta.client) {
    postFullSizeImages = useLocalStorage('settings-postFullSizeImages', false, {
      writeDefaults: false
    })
    postsPerPage = useLocalStorage('settings-postsPerPage', 29, {
      writeDefaults: false
    })
    postsLayout = useLocalStorage<PostsLayout>('settings-postsLayout', 'list', {
      writeDefaults: false
    })
    autoplayAnimatedMedia = useLocalStorage('settings-autoplayAnimatedMedia', false, {
      writeDefaults: false
    })
    blockAiGeneratedImages = useLocalStorage('settings-blockAiGeneratedImages', false, {
      writeDefaults: false
    })
  }

  return {
    postFullSizeImages,
    postsPerPage,
    postsLayout,
    autoplayAnimatedMedia,
    blockAiGeneratedImages
  }
}
