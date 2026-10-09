import { isFluidPlayerLoaded, loadFluidPlayer } from '~/assets/js/fluid-player-loader'
import { buildFluidPlayerOptions, getVideoAdList } from '~/assets/js/fluid-player-options'

interface FluidVideoPlayerOptions {
  /** The native video the player upgrades; null while it is not rendered (error card, sandbox, other media) */
  getVideoElement: () => HTMLVideoElement | null
  /** Source of the active candidate, used for the download link and to restore an emptied VAST reset */
  getSource: () => string
}

/**
 * Upgrades a post's native `<video>` to Fluid Player and owns that player's lifecycle: lazy creation,
 * deferred scheduling on a cold page load, re-creation after a source change and teardown.
 * Fluid is a progressive enhancement, so a failed upgrade leaves the native video usable.
 */
export function useFluidVideoPlayer({ getVideoElement, getSource }: FluidVideoPlayerOptions) {
  const localePath = useLocalePath()
  const { t } = useI18n()
  const { isPremium } = useUserData()
  const { timesVideoHasRendered } = useEthics()
  const { schedule: scheduleIdleTask } = useIdleTask()

  let player: FluidPlayerInstance | undefined
  let initPromise: Promise<void> | null = null
  let isIdleUpgradeQueued = false
  let upgradeTimeout: number | null = null
  let hasCountedRender = false
  let isDisposed = false

  async function create() {
    const videoElement = getVideoElement()

    if (!videoElement) {
      throw new Error('Media element not found')
    }

    const { default: fluidPlayer } = await loadFluidPlayer()

    // The element can be replaced or removed while the module loads
    const currentElement = getVideoElement()

    if (isDisposed || !currentElement) {
      return
    }

    let adList: ReturnType<typeof getVideoAdList> = []

    if (!isPremium.value) {
      // Count each mounted video once, not on every fallback/retry player re-creation
      if (!hasCountedRender) {
        hasCountedRender = true
        timesVideoHasRendered.value++
      }

      adList = getVideoAdList(timesVideoHasRendered.value)
    }

    player = fluidPlayer(
      currentElement,
      buildFluidPlayerOptions({
        adList,
        adText: t('media.adText'),
        removeAdsLabel: t('media.removeAds'),
        removeAdsHref: localePath('/premium?utm_source=internal&utm_medium=player-context-menu#pricing'),
        downloadLabel: t('media.download'),
        downloadHref: getSource(),
        onEmptyVast() {
          const element = getVideoElement()

          if (!element?.src.endsWith('/null')) {
            return
          }

          element.src = getSource()
          player?.play()
        }
      })
    )

    // Fluid clips its wrapper (overflow: hidden), which cuts off the right-click menu near the edges. Without the clip
    // the inline-block wrapper sits on the text baseline and leaves a gap under the video, so align it to the top.
    const wrapper = currentElement.closest<HTMLElement>('.fluid_video_wrapper')
    wrapper?.style.setProperty('overflow', 'visible')
    wrapper?.style.setProperty('vertical-align', 'top')
  }

  function initialize() {
    if (player || initPromise) {
      return initPromise
    }

    initPromise = create()
      .catch((initError) => {
        // Dynamic import or player initialization failed; the native video remains usable.
        if (import.meta.dev) {
          console.error('[PostMedia] Fluid Player failed to initialize', initError)
        }
      })
      .finally(() => {
        initPromise = null
      })

    return initPromise
  }

  function cancelScheduledUpgrade() {
    if (upgradeTimeout === null) {
      return
    }

    window.clearTimeout(upgradeTimeout)
    upgradeTimeout = null
    isIdleUpgradeQueued = false
  }

  function scheduleUpgrade(delay = 1200, timeout = 4000) {
    if (player || initPromise) {
      return
    }

    // The deferral below only protects the cold page load. Once Fluid Player is in memory, upgrade right away
    // so videos scrolled into view never show the native player first, even if an idle upgrade is still queued
    // (its callback re-checks the player state, so it cannot initialize twice).
    if (isFluidPlayerLoaded()) {
      initialize()
      return
    }

    if (isIdleUpgradeQueued) {
      return
    }

    isIdleUpgradeQueued = true

    upgradeTimeout = window.setTimeout(() => {
      upgradeTimeout = null

      scheduleIdleTask(() => {
        isIdleUpgradeQueued = false

        // No viewport check on purpose: once queued, upgrade even if scrolled away, so the player never
        // visibly swaps in over the native one while the user scrolls past.
        if (isDisposed || player || initPromise || !getVideoElement()) {
          return
        }

        initialize()
      }, timeout)
    }, delay)
  }

  function destroy() {
    player?.destroy()
    player = undefined
  }

  /** Re-creates the player, e.g. after the keyed `<video>` was replaced by one with a new source. */
  async function reload(shouldPlay = false) {
    await nextTick()
    destroy()

    await nextTick()
    await initialize()

    if (shouldPlay) {
      await nextTick()
      player?.play()
    }
  }

  function pause() {
    try {
      player?.pause()
    } catch {
      // Ignore if the player is torn down
    }
  }

  onBeforeUnmount(() => {
    isDisposed = true
    cancelScheduledUpgrade()
    destroy()
  })

  return { initialize, scheduleUpgrade, cancelScheduledUpgrade, destroy, reload, pause }
}
