import { useToggle } from '@vueuse/core'

const [value, toggle] = useToggle()
const currentIndex = ref(0)

export function usePremiumDialog() {
  return {
    open: value,
    toggleOpen: toggle,

    currentIndex
  }
}
