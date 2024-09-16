import { useLocalStorage } from '@vueuse/core'

export default function () {
  let postFullSizeImages = ref<boolean>(false)
  let postsPerPage = ref<number>(29)

  onMounted(() => {
    postFullSizeImages = useLocalStorage('settings-postFullSizeImages', false, {
      writeDefaults: false
    })
    postsPerPage = useLocalStorage('settings-postsPerPage', 29, {
      writeDefaults: false
    })
  })

  return reactive({
    postFullSizeImages,
    postsPerPage
  })
}
