import { useIdleTask } from '~/composables/useIdleTask'

let fluidPlayerPromise: Promise<typeof import('fluid-player')> | null = null
let isLoaded = false
let isPrefetchScheduled = false

/**
 * Loads Fluid Player (and its CSS) once and shares the result across every video.
 * A failed load is not cached, so a later call can retry.
 */
export function loadFluidPlayer() {
  fluidPlayerPromise ??= Promise.all([import('fluid-player'), import('fluid-player/src/css/fluidplayer.css')])
    .then(([fluidPlayerModule]) => {
      isLoaded = true

      return fluidPlayerModule
    })
    .catch((error) => {
      fluidPlayerPromise = null

      throw error
    })

  return fluidPlayerPromise
}

/**
 * Whether Fluid Player is already in memory. Videos can then upgrade immediately instead of waiting out the
 * cold-load deferral, which only exists to keep the download and init away from the initial page load.
 */
export function isFluidPlayerLoaded() {
  return isLoaded
}

/**
 * Warms the Fluid Player module once the page has loaded and the browser is idle, so the first video scrolled
 * into view upgrades instantly too.
 */
export function prefetchFluidPlayerWhenIdle() {
  if (!import.meta.client || isPrefetchScheduled) {
    return
  }

  isPrefetchScheduled = true

  const { schedule } = useIdleTask()
  const prefetch = () => schedule(() => void loadFluidPlayer().catch(() => {}), 4000)

  if (document.readyState === 'complete') {
    prefetch()
    return
  }

  window.addEventListener('load', prefetch, { once: true })
}
