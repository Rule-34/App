import { useToggle } from '@vueuse/core'

const [value, toggle] = useToggle(false)

export function useMenu() {
  return {
    value,
    toggle
  }
}
