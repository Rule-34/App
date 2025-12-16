import { useThrottleFn } from '@vueuse/core'

export const useFeedAutoplay = () => {
  const { autoplayVideos } = useUserSettings()

  const activeVideoId = useState<number | null>('feedAutoplay:activeVideoId', () => null)
  const visibleElements = useState<Map<number, HTMLElement>>('feedAutoplay:visibleElements', () => new Map())
  const listening = useState<boolean>('feedAutoplay:listening', () => false)

  const calculateBestVideo = () => {
    if (visibleElements.value.size === 0) {
      if (activeVideoId.value) activeVideoId.value = null
      return
    }

    const center = window.innerHeight / 2
    let bestId: number | null = null
    let minDiff = Infinity

    for (const [id, element] of visibleElements.value) {
      const rect = element.getBoundingClientRect()
      const diff = Math.abs(center - (rect.top + rect.height / 2))

      if (diff < minDiff) {
        minDiff = diff
        bestId = id
      }
    }

    if (bestId !== null && bestId !== activeVideoId.value) {
      activeVideoId.value = bestId
    }
  }

  const throttledCheck = useThrottleFn(calculateBestVideo, 200)

  const toggleListeners = (enable: boolean) => {
    if (listening.value === enable || typeof window === 'undefined') return

    const options = { passive: true }

    if (enable) {
      window.addEventListener('scroll', throttledCheck, options)
      window.addEventListener('resize', throttledCheck, options)
    } else {
      window.removeEventListener('scroll', throttledCheck, options)
      window.removeEventListener('resize', throttledCheck, options)
    }

    listening.value = enable
  }

  const updateCandidate = (id: number, element: HTMLElement | null, isVisible: boolean) => {
    if (!import.meta.client || !autoplayVideos.value) {
      return
    }

    if (isVisible && element) {
      visibleElements.value.set(id, element)
    } else {
      visibleElements.value.delete(id)
    }

    toggleListeners(visibleElements.value.size > 0)
    throttledCheck()
  }

  return { activeVideoId, updateCandidate }
}
