export type FluidPlayerOptionsWithPlaybackRates = Partial<FluidPlayerOptions> & {
  layoutControls?: Partial<
    Omit<LayoutControls, 'controlBar'> & {
      controlBar?: Partial<LayoutControls['controlBar'] & { playbackRates: string[] }>
    }
  >
}

type AdList = NonNullable<VastOptions['adList']>

/**
 * Ads for a free user's video, decided by how many videos have rendered so far.
 * The commented tags are alternative providers that were tried and earned less.
 */
export function getVideoAdList(videosRendered: number): AdList {
  const adList: AdList = []

  // Only show pause roll ads every 2 videos
  if (videosRendered % 2 === 0) {
    adList.push(
      // In-Video Banner
      {
        roll: 'onPauseRoll',
        vastTag:
          /**
           * ExoClick
           * Pros:
           * Cons: Low revenue (7)
           */
          'https://s.magsrv.com/splash.php?idzone=5386214'
      }
    )
  }

  // Only show preroll ads after 3 videos, and every 3 videos
  if (videosRendered > 3 && videosRendered % 3 === 0) {
    adList.push(
      // In-Stream Video
      {
        roll: 'preRoll',
        vastTag:
          /**
           * ExoClick
           * Pros:
           * Cons: Low revenue (9)
           */
          'https://s.magsrv.com/splash.php?idzone=5386496'

        /**
         * HilltopAds
         * Pros:
         * Cons: Low revenue (4)
         */
        // 'https://ellipticaltrack.com/dCm.FXz/doGMNPv/Z-GhUX/OermX9/u-ZqUEltk/PYTgYBy/ODTZQI5oNHDDEHtdNbjLIS5eNvDhk/0uMGgu?limit=1'

        /**
         * Clickadu
         * Pros:
         * Cons:
         */
        // 'https://anewfeedliberty.com/ceef/gdt3g0/tbt/2034767/tlk.xml'

        /**
         * AdSession
         * Pros:
         * Cons:
         */
        // 'https://s.eunow4u.com/v1/vast.php?idzone=2310'
      }
    )
  }

  return adList
}

export interface FluidPlayerOptionsInput {
  adList: AdList
  adText: string
  removeAdsLabel: string
  removeAdsHref: string
  downloadLabel: string
  downloadHref: string
  /** Fluid ends an empty VAST by resetting the video source to "null"; the caller restores the real one */
  onEmptyVast: () => void
}

export function buildFluidPlayerOptions(input: FluidPlayerOptionsInput): FluidPlayerOptionsWithPlaybackRates {
  return {
    layoutControls: {
      primaryColor: 'rgba(0, 0, 0, 0.7)',

      fillToContainer: true,

      // Round only the top, like the card; Fluid applies it to its wrapper and the video.
      // It takes any CSS border-radius shorthand at runtime, its typings only allow a number.
      roundedCorners: '6px 6px 0 0' as unknown as number,

      preload: 'none',

      loop: true,

      playbackRateEnabled: true,

      allowTheatre: false,

      autoRotateFullScreen: true,

      // Fix: Opening in fullscreen when searching something with "F"
      keyboardControl: false,

      controlBar: {
        autoHide: true,

        playbackRates: ['x2', 'x1.5', 'x1', 'x0.75', 'x0.5', 'x0.25']
      },

      contextMenu: {
        controls: true,

        links: [
          { label: input.removeAdsLabel, href: input.removeAdsHref },
          { label: input.downloadLabel, href: input.downloadHref }
        ]
      },

      miniPlayer: {
        enabled: false
      }
    },

    onBeforeXMLHttpRequest(request) {
      request.withCredentials = false
    },

    vastOptions: {
      adText: input.adText,

      vastAdvanced: {
        vastVideoEndedCallback: input.onEmptyVast
      },

      adList: input.adList
    }
  }
}
