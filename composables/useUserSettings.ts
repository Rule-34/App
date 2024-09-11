import { useStorage } from '@vueuse/core'

let postFullSizeImages = ref<boolean>(false)
let postsPerPage = ref<number>(29)

if (process.client) {
  postFullSizeImages = useStorage('settings-postFullSizeImages', false, localStorage, {
    writeDefaults: false
  })
  postsPerPage = useStorage('settings-postsPerPage', 29, localStorage, {
    writeDefaults: false
  })
}

export function useUserSettings() {
  return reactive({
    postFullSizeImages,
    postsPerPage
  })
}
