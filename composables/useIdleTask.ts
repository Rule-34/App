export function useIdleTask() {
  function schedule(callback: () => void, timeout = 2000) {
    if (!import.meta.client) {
      return
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout })
      return
    }

    window.setTimeout(callback, timeout)
  }

  return { schedule }
}
