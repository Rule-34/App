import { useToggle } from '@vueuse/core'

const [value, toggle] = useToggle(false)

export function useSearchMenu() {
  return {
    value,
    toggle
  }
}
