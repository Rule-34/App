import { useEventListener } from '@vueuse/core'

export function useInteractionDetector() {
  const hasInteracted = useState('hasInteracted', () => false)

  if (hasInteracted.value) {
    return { hasInteracted }
  }

  const interactionEvents = ['mousedown', 'touchstart']

  const cleanup = interactionEvents.map((event) => useEventListener(window, event, handleInteraction))

  function handleInteraction() {
    hasInteracted.value = true
    cleanup.forEach((unregister) => unregister())
  }

  return { hasInteracted }
}
