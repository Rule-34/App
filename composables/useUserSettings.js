import { useStorage } from '@vueuse/core'

const version = useStorage('settings-version', 1, localStorage)

const navigationTouchGestures = useStorage('settings-navigationTouchGestures', true, localStorage, {
  writeDefaults: false
})
const postFullSizeImages = useStorage('settings-postFullSizeImages', false, localStorage, {
  writeDefaults: false
})
const postsPerPage = useStorage('settings-postsPerPage', 35, localStorage, {
  writeDefaults: false
})

export const useUserSettings = () => {
  return reactive({
    version,

    navigationTouchGestures,

    postFullSizeImages,
    postsPerPage
  })
}
