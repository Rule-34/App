import { useToggle } from '@vueuse/core'

export default function () {
  const value = useState<boolean>('search-menu-open', () => false)
  const toggle = useToggle(value)

  return {
    value,
    toggle
  }
}
