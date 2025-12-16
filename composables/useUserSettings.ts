import { useLocalStorage } from '@vueuse/core'

export default function () {
  let postFullSizeImages = ref<boolean>(true)
  let postsPerPage = ref<number>(29)
  let autoplayAnimatedMedia = ref<boolean>(false)
  let autoplayVideos = ref<boolean>(false)

  if (import.meta.client) {
    postFullSizeImages = useLocalStorage('settings-postFullSizeImages', true, {
      writeDefaults: false
    })
    postsPerPage = useLocalStorage('settings-postsPerPage', 29, {
      writeDefaults: false
    })
    autoplayAnimatedMedia = useLocalStorage('settings-autoplayAnimatedMedia', false, {
      writeDefaults: false
    })
    autoplayVideos = useLocalStorage('settings-autoplayVideos', false, {
      writeDefaults: false
    })
  }

  return {
    postFullSizeImages,
    postsPerPage,
    autoplayAnimatedMedia,
    autoplayVideos
  }
}
