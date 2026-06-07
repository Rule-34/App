import { useToggle } from '@vueuse/core'

export const premiumPromotionIndices = {
  savePost: 2,
  history: 3,
  additionalBoorus: 4,
  downloadPost: 5,
  tagCollections: 6,
  blocklist: 6,
  sourceFinder: 7
} as const

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
