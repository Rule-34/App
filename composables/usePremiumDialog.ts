import { useToggle } from '@vueuse/core'

export default function () {
  const value = useState<boolean>('premium-dialog-open', () => false)
  const toggle = useToggle(value)

  const currentIndex = useState<number>('premium-dialog-current-index', () => 0)

  return {
    open: value,
    toggleOpen: toggle,

    currentIndex
  }
}
