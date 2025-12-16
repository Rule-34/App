import { useThrottleFn } from '@vueuse/core'

// Only track elements that are currently visible
const visibleElements = new Map<number, HTMLElement>()
let globalActiveVideoId: Ref<number | null> | null = null

const calculateBestVideo = () => {
  if (!globalActiveVideoId || visibleElements.size === 0) {
    if (globalActiveVideoId?.value) globalActiveVideoId.value = null
    return
  }

  const center = window.innerHeight / 2
  let bestId: number | null = null
  let minDiff = Infinity

  for (const [id, element] of visibleElements) {
    const rect = element.getBoundingClientRect()
    const diff = Math.abs(center - (rect.top + rect.height / 2))

    if (diff < minDiff) {
      minDiff = diff
      bestId = id
    }
  }

  if (bestId !== null && bestId !== globalActiveVideoId.value) {
    globalActiveVideoId.value = bestId
  }
}

const throttledCheck = useThrottleFn(calculateBestVideo, 200)

let listening = false
const toggleListeners = (enable: boolean) => {
  if (listening === enable || typeof window === 'undefined') return
  const method = enable ? 'addEventListener' : 'removeEventListener'
  // @ts-expect-error - EventListener options overlap
  window[method]('scroll', throttledCheck, { passive: true })
  // @ts-expect-error - EventListener options overlap
  window[method]('resize', throttledCheck, { passive: true })
  listening = enable
}

export const useFeedAutoplay = () => {
  const activeVideoId = useState<number | null>('activeVideoId', () => null)
  if (import.meta.client) globalActiveVideoId = activeVideoId

  const updateCandidate = (id: number, element: HTMLElement | null, isVisible: boolean) => {
    if (!import.meta.client) return

    if (isVisible && element) {
      visibleElements.set(id, element)
    } else {
      visibleElements.delete(id)
    }

    toggleListeners(visibleElements.size > 0)
    throttledCheck()
  }

  return { activeVideoId, updateCandidate }
}
