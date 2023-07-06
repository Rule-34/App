import { useStorage, useToggle } from '@vueuse/core'

const lastPostsPage = useStorage<string | undefined>('settings-lastPostsPage', undefined, localStorage, {
  writeDefaults: false
})

const [isMenuActive, toggleMenu] = useToggle(false)

export function useRestoreLastSessionPopup() {
  return {
    lastPostsPage,

    isMenuActive,
    toggleMenu
  }
}
