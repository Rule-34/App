import { useStorage } from '@vueuse/core'

let navigationTouchGestures = ref<boolean>(true)
let postFullSizeImages = ref<boolean>(false)
let postsPerPage = ref<number>(30)

if (process.client) {
  navigationTouchGestures = useStorage('settings-navigationTouchGestures', true, localStorage, {
    writeDefaults: false
  })
  postFullSizeImages = useStorage('settings-postFullSizeImages', false, localStorage, {
    writeDefaults: false
  })
  postsPerPage = useStorage('settings-postsPerPage', 29, localStorage, {
    writeDefaults: false
  })
}

export function useUserSettings() {
  return reactive({
    navigationTouchGestures,

    postFullSizeImages,
    postsPerPage
  })
}
