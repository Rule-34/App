import { useLocalStorage } from '@vueuse/core'

export const defaultPostsPerPage = 29

/** The API takes 1–100 posts per page; a stored value outside that (or not a number) falls back to the default. */
function toPostsPerPage(value: unknown) {
  const postsPerPage = Number(value)

  return Number.isInteger(postsPerPage) && postsPerPage >= 1 ? Math.min(postsPerPage, 100) : defaultPostsPerPage
}

export default function () {
  let postFullSizeImages = ref<boolean>(false)
  let storedPostsPerPage = ref<number>(defaultPostsPerPage)
  let autoplayAnimatedMedia = ref<boolean>(false)
  let blockAiGeneratedImages = ref<boolean>(false)

  if (import.meta.client) {
    postFullSizeImages = useLocalStorage('settings-postFullSizeImages', false, {
      writeDefaults: false
    })
    storedPostsPerPage = useLocalStorage('settings-postsPerPage', defaultPostsPerPage, {
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
    /** What the settings input edits; read `postsPerPage` everywhere else */
    storedPostsPerPage,
    postsPerPage: computed(() => toPostsPerPage(storedPostsPerPage.value)),
    autoplayAnimatedMedia,
    blockAiGeneratedImages
  }
}
