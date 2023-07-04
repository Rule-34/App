import { useStorage } from '@vueuse/core'

const version = useStorage('settings-version', 1, localStorage)

const navigationTouchGestures = useStorage('settings-navigationTouchGestures', true, localStorage, {
  writeDefaults: false
})
const postFullSizeImages = useStorage('settings-postFullSizeImages', false, localStorage, {
  writeDefaults: false
})
const postsPerPage = useStorage('settings-postsPerPage', 30, localStorage, {
  writeDefaults: false
})
const lastPostsPage = useStorage<string | undefined>('settings-lastPostsPage', undefined, localStorage, {
  writeDefaults: false
})

export function useUserSettings() {
  return reactive({
    version,

    navigationTouchGestures,

    postFullSizeImages,
    postsPerPage,

    lastPostsPage
  })
}
