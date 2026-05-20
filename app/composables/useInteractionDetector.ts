import { defaultWindow, tryOnScopeDispose, useEventListener } from '@vueuse/core'

export function useInteractionDetector() {
  const hasInteracted = useState('hasInteracted', () => false)

  if (hasInteracted.value) {
    return { hasInteracted }
  }

  const interactionEvents = ['pointerdown', 'keydown']
  const ignoreSelectors = [
    // Dialogs
    '[role="dialog"]'
  ]

  const cleanup = defaultWindow
    ? interactionEvents.map((event) => useEventListener(defaultWindow, event, handleInteraction, { passive: true }))
    : []

  function cleanupListeners() {
    cleanup.forEach((unregister) => unregister())
  }

  tryOnScopeDispose(cleanupListeners)

  function handleInteraction(event: Event) {
    //

    // Ignore interactions on elements matching certain selectors
    if (event.target instanceof Element) {
      const target = event.target

      if (ignoreSelectors.some((selector) => target.closest(selector))) {
        return
      }
    }

    hasInteracted.value = true
    cleanupListeners()
  }

  return { hasInteracted }
}
