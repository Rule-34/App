import {useToggle} from '@vueuse/core'

export default function () {
  const value = useState<boolean>('menu-open', () => false)
  const toggle = useToggle(value)

  return {
    value,
    toggle
  }
}
