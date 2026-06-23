<script lang="ts" setup>
  import type { IPost, PostMediaType } from '~/assets/js/post.dto'
  import { vIntersectionObserver } from '@vueuse/components'
  import { getImgproxyUrl } from '~/assets/js/nuxt-image/get-imgproxy-url'
  import { proxyUrl } from '~/assets/js/proxy'

  const localePath = useLocalePath()
  const { t } = useI18n()
  const { isPremium } = useUserData()
  const { autoplayAnimatedMedia } = useUserSettings()
  const { timesVideoHasRendered } = useEthics()
  const { wasCurrentPageSSR } = useSSRDetection()
  const { schedule: scheduleIdleTask } = useIdleTask()

  export interface PostMediaProps {
    postIndex: number

    mediaSrc: IPost['high_res_file']['url']
    mediaSrcHeight: IPost['high_res_file']['height'] | null
    mediaSrcWidth: IPost['high_res_file']['width'] | null
    mediaPosterSrc: string | null
    mediaType: PostMediaType
    mediaAlt: string
  }

  const props = defineProps<PostMediaProps>()

  type MediaElementRef = HTMLElement | { $el?: Element } | null
  type FluidPlayerOptionsWithPlaybackRates = Partial<FluidPlayerOptions> & {
    layoutControls?: Partial<
      Omit<LayoutControls, 'controlBar'> & {
        controlBar?: Partial<LayoutControls['controlBar'] & { playbackRates: string[] }>
      }
    >
  }

  const mediaElement = shallowRef<MediaElementRef>(null)

  const shouldProxyPosterWithImgproxy = computed(() => isPremium.value || (wasCurrentPageSSR.value && props.postIndex < 8))

  function resolvePosterSrc(posterSrc: string | null | undefined) {
    if (!posterSrc) {
      return undefined
    }

    if (shouldProxyPosterWithImgproxy.value) {
      return getImgproxyUrl(posterSrc)
    }

    return posterSrc
  }

  const localSrc = shallowRef(props.mediaSrc ?? '')
  const localPosterSrc = shallowRef(resolvePosterSrc(props.mediaPosterSrc))
  const triedToLoadWithProxy = shallowRef(false)
  const triedToLoadPosterWithProxy = shallowRef(false)

  watch(
    () => [props.mediaPosterSrc, shouldProxyPosterWithImgproxy.value] as const,
    ([posterSrc]) => {
      if (triedToLoadPosterWithProxy.value) {
        return
      }

      localPosterSrc.value = resolvePosterSrc(posterSrc)
    }
  )

  const error = ref<Error | null>(null)
  const hasError = computed(() => error.value !== null)

  const isImage = computed(() => props.mediaType === 'image')
  const isVideo = computed(() => props.mediaType === 'video')
  const isAnimatedMedia = computed(
    () => props.mediaType === 'animated' || (props.mediaType === 'image' && localSrc.value.endsWith('.gif'))
  )
  const postImageSizes = {
    sm: '400px',
    md: '768px'
  }
  const isLikelyLcpMedia = computed(() => props.postIndex === 0)
  const mediaDecoding = computed(() => (props.postIndex < 3 ? undefined : 'async'))
  const mediaFetchPriority = computed(() => (isLikelyLcpMedia.value ? 'high' : undefined))
  const mediaLoading = computed(() => (isLikelyLcpMedia.value ? 'eager' : 'lazy'))
  const mediaPreload = computed(() => (isLikelyLcpMedia.value ? { fetchPriority: 'high' as const } : false))
  const mediaSrcHeightAttribute = computed(() => props.mediaSrcHeight ?? undefined)
  const mediaSrcWidthAttribute = computed(() => props.mediaSrcWidth ?? undefined)
  const mediaAspectRatio = computed(() =>
    props.mediaSrcWidth && props.mediaSrcHeight ? `${props.mediaSrcWidth}/${props.mediaSrcHeight}` : undefined
  )
  const lcpVideoPosterPreloadLinks = computed(() => {
    if (!isLikelyLcpMedia.value || !isVideo.value || !localPosterSrc.value) {
      return []
    }

    return [
      {
        rel: 'preload',
        as: 'image' as const,
        href: localPosterSrc.value,
        fetchpriority: 'high' as const
      }
    ]
  })

  useHead(() => ({
    link: lcpVideoPosterPreloadLinks.value
  }))

  let videoPlayer: FluidPlayerInstance | undefined
  let videoPlayerInitPromise: Promise<void> | null = null
  let videoPlayerIdleScheduled = false
  let videoPlayerInitTimeout: number | null = null
  let isUnmounted = false

  const isAnimatedMediaLoading = ref(false)
  const isAnimatedMediaPlaying = ref(false)
  const mediaHasLoaded = ref(false)

  onMounted(() => {
    const resolvedMediaElement = getResolvedMediaElement()

    if (!resolvedMediaElement) {
      return
    }

    if (isAnimatedMedia.value && autoplayAnimatedMedia.value && !isAnimatedMediaPlaying.value) {
      startPlayingAnimatedMedia()
    }
  })

  onBeforeUnmount(() => {
    isUnmounted = true

    if (videoPlayerInitTimeout !== null) {
      window.clearTimeout(videoPlayerInitTimeout)
      videoPlayerInitTimeout = null
      videoPlayerIdleScheduled = false
    }

    let finalMediaElement = getResolvedMediaElement()

    if (finalMediaElement == null) {
      return
    }

    if (isImage.value || isAnimatedMedia.value) {
      // If its a picture, get the img element
      if (finalMediaElement instanceof HTMLPictureElement) {
        finalMediaElement = finalMediaElement.querySelector('img')
      }

      if (!finalMediaElement) {
        return
      }

      // Cancel any pending media requests - https://stackoverflow.com/a/28060352
      finalMediaElement.removeAttribute('src')
    }

    //
    else if (isVideo.value) {
      destroyVideoPlayer()
    }
  })

  async function createVideoPlayer() {
    const videoElement = getVideoElement()

    if (!videoElement) {
      throw new Error('Media element not found')
    }

    if (!isVideo.value) {
      throw new Error('Media is not a video')
    }

    const [fluidPlayerModule] = await Promise.all([
      import('fluid-player'),
      import('fluid-player/src/css/fluidplayer.css')
    ])

    const initializedVideoElement = getVideoElement()

    if (isUnmounted || !initializedVideoElement) {
      return
    }

    const fluidPlayer = fluidPlayerModule.default
    const adList: NonNullable<VastOptions['adList']> = []

    const fluidPlayerOptions: FluidPlayerOptionsWithPlaybackRates = {
      layoutControls: {
        primaryColor: 'rgba(0, 0, 0, 0.7)',

        fillToContainer: true,

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
            {
              label: t('media.removeAds'),
              href: localePath('/premium?utm_source=internal&utm_medium=player-context-menu#pricing')
            },
            {
              label: t('media.download'),
              href: localSrc.value
            }
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
        adText: t('media.adText'),

        vastAdvanced: {
          /**
           * Handle empty VAST
           */
          vastVideoEndedCallback() {
            const currentVideoElement = getVideoElement()

            if (!currentVideoElement?.src.endsWith('/null')) {
              return
            }

            currentVideoElement.src = localSrc.value
            videoPlayer?.play()
          }
        },

        adList
      }
    }

    if (!isPremium.value) {
      timesVideoHasRendered.value++

      // Only show pause roll ads every 2 videos
      if (timesVideoHasRendered.value % 2 === 0) {
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
      //

      // Only show preroll ads after 3 videos, and every 3 videos
      if (timesVideoHasRendered.value > 3 && timesVideoHasRendered.value % 3 === 0) {
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
    }

    videoPlayer = fluidPlayer(initializedVideoElement, fluidPlayerOptions)
  }

  function initializeVideoPlayer() {
    if (videoPlayer || videoPlayerInitPromise) {
      return videoPlayerInitPromise
    }

    videoPlayerInitPromise = createVideoPlayer()
      .catch(() => {
        // Dynamic import or player initialization failed; the native video remains usable.
      })
      .finally(() => {
        videoPlayerInitPromise = null
      })

    return videoPlayerInitPromise
  }

  function scheduleVideoPlayerInitialization(delay = 1200, timeout = 4000) {
    if (videoPlayer || videoPlayerInitPromise || videoPlayerIdleScheduled) {
      return
    }

    videoPlayerIdleScheduled = true

    videoPlayerInitTimeout = window.setTimeout(() => {
      videoPlayerInitTimeout = null

      scheduleIdleTask(() => {
        videoPlayerIdleScheduled = false

        if (isUnmounted || videoPlayer || videoPlayerInitPromise || !getVideoElement() || !isVideo.value) {
          return
        }

        initializeVideoPlayer()
      }, timeout)
    }, delay)
  }

  function destroyVideoPlayer() {
    if (!videoPlayer) {
      return
    }

    videoPlayer.destroy()
    videoPlayer = undefined
  }

  async function reloadVideoPlayer(shouldPlay: boolean = false) {
    await nextTick()
    destroyVideoPlayer()

    await nextTick()
    try {
      await initializeVideoPlayer()
    } catch {
      // Player re-creation failed
      return
    }

    if (shouldPlay) {
      await nextTick()
      videoPlayer?.play()
    }
  }

  function startPlayingAnimatedMedia() {
    isAnimatedMediaLoading.value = true
    isAnimatedMediaPlaying.value = true
  }

  function onMediaError(payload: string | Event) {
    if (hasError.value) {
      return
    }

    if (!(payload instanceof Event)) {
      error.value = new Error(t('errors.mediaLoadError'))
      return
    }

    const target =
      payload.target instanceof HTMLImageElement || payload.target instanceof HTMLVideoElement ? payload.target : null

    if (!target?.src) {
      return
    }

    // Reset loading state if there's an error with GIF
    if (isAnimatedMedia.value && isAnimatedMediaPlaying.value) {
      isAnimatedMediaLoading.value = false
    }

    // Proxy GIFs
    if (isAnimatedMedia.value && isPremium.value) {
      //

      // Case 1: The poster image failed to load
      if (
        !isAnimatedMediaPlaying.value &&
        target.src === localPosterSrc.value &&
        //
        !triedToLoadPosterWithProxy.value
      ) {
        if (!localPosterSrc.value) {
          return
        }

        localPosterSrc.value = proxyUrl(localPosterSrc.value)

        triedToLoadPosterWithProxy.value = true
        return
      }

      // Case 2: The actual GIF failed to load
      if (
        isAnimatedMediaPlaying.value &&
        //
        !triedToLoadWithProxy.value
      ) {
        localSrc.value = proxyUrl(localSrc.value)

        triedToLoadWithProxy.value = true
        return
      }
    }

    error.value = new Error(t('errors.mediaLoadError'))
  }

  function onVideoPosterPreloadError() {
    if (!isPremium.value || triedToLoadPosterWithProxy.value || !props.mediaPosterSrc) {
      return
    }

    localPosterSrc.value = proxyUrl(props.mediaPosterSrc)
    triedToLoadPosterWithProxy.value = true
  }

  function onVideoPlaybackError(event: Event) {
    if (hasError.value || !(event.target instanceof HTMLVideoElement) || !isPremium.value || triedToLoadWithProxy.value) {
      return
    }

    localSrc.value = proxyUrl(props.mediaSrc ?? '')
    reloadVideoPlayer(true)
    triedToLoadWithProxy.value = true
  }

  function manuallyReloadMedia() {
    // Reset state
    triedToLoadWithProxy.value = false
    triedToLoadPosterWithProxy.value = false
    error.value = null

    // Reload media
    localSrc.value = props.mediaSrc ?? ''
    localPosterSrc.value = resolvePosterSrc(props.mediaPosterSrc)

    if (isVideo.value) {
      nextTick(() => {
        reloadVideoPlayer()
      })
    }
  }

  /**
   * Stops videos when they are out of the viewport
   */
  function onVideoIntersectionObserver(entries: IntersectionObserverEntry[]) {
    // Skip on fullscreen
    if (document.fullscreenElement) {
      return
    }

    const entry = entries[0]

    if (!entry) {
      return
    }

    if (entry.isIntersecting) {
      scheduleVideoPlayerInitialization(isLikelyLcpMedia.value ? 1200 : 1600)
      return
    }

    if (!entry.isIntersecting) {
      videoPlayer?.pause()
    }
  }

  function onMediaLoad() {
    mediaHasLoaded.value = true

    // Clear loading state if it's a GIF
    if (isAnimatedMedia.value && isAnimatedMediaPlaying.value) {
      isAnimatedMediaLoading.value = false
    }
  }

  /**
   * Fix: Handle SSR case where media has loaded but this script hasn't run yet
   */
  onMounted(() => {
    // Only apply to regular images, not GIFs (we want GIFs to show the poster first)
    if (!isImage.value) {
      return
    }

    const mediaImageElement = getMediaImageElement()

    if (!mediaImageElement) {
      return
    }

    if (!mediaImageElement.complete) {
      return
    }

    mediaHasLoaded.value = true
  })

  function getResolvedMediaElement(): HTMLElement | null {
    const value = mediaElement.value

    if (value instanceof HTMLElement) {
      return value
    }

    if (value?.$el instanceof HTMLElement) {
      return value.$el
    }

    return null
  }

  function getMediaImageElement(): HTMLImageElement | null {
    const element = getResolvedMediaElement()

    if (element instanceof HTMLImageElement) {
      return element
    }

    if (element instanceof HTMLPictureElement) {
      return element.querySelector('img')
    }

    return null
  }

  function getVideoElement(): HTMLVideoElement | null {
    const element = getResolvedMediaElement()

    return element instanceof HTMLVideoElement ? element : null
  }
</script>

<template>
  <div :style="mediaAspectRatio ? `aspect-ratio: ${mediaAspectRatio};` : undefined">
    <!-- Error -->
    <template v-if="hasError">
      <div class="flex h-full flex-col items-center space-y-4 py-4">
        <div class="flex flex-1 flex-col items-center justify-center gap-4">
          <span
            class="rounded-md bg-linear-to-l from-base-950 via-base-900 to-base-900 px-4 py-1.5 text-center text-base-content-highlight"
          >
            {{ error?.message }}
          </span>

          <button
            class="mx-auto inline-flex items-center justify-center rounded-md px-2 py-1 text-sm ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
            type="button"
            @click="manuallyReloadMedia"
          >
            {{ t('media.tryAgain') }}
          </button>
        </div>

        <!-- Premium promotion -->
        <!-- TODO: Improve style -->
        <div
          v-if="!isPremium"
          class="text-xs text-base-content"
        >
          <NuxtLink
            :href="localePath('/premium?utm_source=internal&utm_medium=media-error#pricing')"
            class="underline hover:hover-text-util focus-visible:focus-outline-util"
          >
            <!-- @formatter:off -->
            {{ t('media.getPremium') }}</NuxtLink
          >

          <span> {{ t('media.toBypassBlocks') }}</span>
        </div>
      </div>
    </template>

    <!-- Image -->
    <!-- TODO: Fix very large images not being on screen so not loaded -->
    <div
      v-else-if="isImage"
      :class="
        !(wasCurrentPageSSR && postIndex < 8) && [
          mediaHasLoaded ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-700 ease-in-out'
        ]
      "
    >
      <!-- Optimized + Proxied images for Premium users -->
      <template v-if="isPremium">
        <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
        <NuxtPicture
          ref="mediaElement"
          :alt="mediaAlt"
          :decoding="mediaDecoding"
          :height="mediaSrcHeightAttribute"
          :img-attrs="
            {
              class: 'h-auto w-full rounded-t-md',
              style: mediaAspectRatio ? 'aspect-ratio: ' + mediaAspectRatio : undefined,
              fetchpriority: mediaFetchPriority
            } as any
          "
          :loading="mediaLoading"
          :preload="mediaPreload"
          :sizes="postImageSizes"
          :src="localSrc"
          :width="mediaSrcWidthAttribute"
          provider="imgproxy"
          @error="onMediaError"
          @load="onMediaLoad"
        />
      </template>

      <!-- Regular images for non-premium users -->
      <template v-else>
        <!-- SSR + first posts: imgproxy keeps crawler/LCP images optimized. -->
        <NuxtPicture
          v-if="wasCurrentPageSSR && postIndex < 8"
          ref="mediaElement"
          :alt="mediaAlt"
          :decoding="mediaDecoding"
          :height="mediaSrcHeightAttribute"
          :img-attrs="
            {
              class: 'h-auto w-full rounded-t-md',
              style: mediaAspectRatio ? 'aspect-ratio: ' + mediaAspectRatio : undefined,
              fetchpriority: mediaFetchPriority
            } as any
          "
          :loading="mediaLoading"
          :preload="mediaPreload"
          :sizes="postImageSizes"
          :src="localSrc"
          :width="mediaSrcWidthAttribute"
          provider="imgproxy"
          @error="onMediaError"
          @load="onMediaLoad"
        />

        <!-- Non-SSR / SPA navigation keeps the direct image path. -->
        <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
        <NuxtImg
          v-else
          ref="mediaElement"
          :alt="mediaAlt"
          :decoding="mediaDecoding"
          :fetchpriority="mediaFetchPriority"
          :height="mediaSrcHeightAttribute"
          :loading="mediaLoading"
          :preload="mediaPreload"
          :src="localSrc"
          :style="mediaAspectRatio ? `aspect-ratio: ${mediaAspectRatio};` : undefined"
          :width="mediaSrcWidthAttribute"
          class="h-auto w-full rounded-t-md"
          @error="onMediaError"
          @load="onMediaLoad"
        />
      </template>
    </div>

    <!-- Animated (GIF) -->
    <div
      v-else-if="isAnimatedMedia"
      class="relative"
    >
      <NuxtImg
        ref="mediaElement"
        :alt="mediaAlt"
        :decoding="mediaDecoding"
        :fetchpriority="mediaFetchPriority"
        :height="mediaSrcHeightAttribute"
        :loading="mediaLoading"
        :preload="mediaPreload"
        :src="isAnimatedMediaPlaying ? localSrc : localPosterSrc"
        :style="mediaAspectRatio ? `aspect-ratio: ${mediaAspectRatio};` : undefined"
        :width="mediaSrcWidthAttribute"
        class="h-auto w-full rounded-t-md"
        @error="onMediaError"
        @load="onMediaLoad"
      />

      <!-- Loading indicator for GIFs -->
      <div
        v-if="isAnimatedMediaLoading && isAnimatedMediaPlaying"
        class="absolute inset-0 flex items-center justify-center rounded-t-md bg-black/20"
      >
        <span class="sr-only"> {{ t('media.loadingMedia') }} </span>

        <span class="rounded-full bg-black/65 p-2">
          <svg
            aria-hidden="true"
            class="h-12 w-12 animate-spin text-white"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
        </span>
      </div>

      <!-- Play button overlay - only shown when GIF is not playing -->
      <button
        v-if="!isAnimatedMediaPlaying"
        :aria-label="t('media.play')"
        class="absolute inset-0 flex items-center justify-center rounded-t-md bg-black/20"
        type="button"
        @click="startPlayingAnimatedMedia"
      >
        <span class="rounded-full bg-black/65 p-2">
          <svg
            aria-hidden="true"
            class="h-12 w-12 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    </div>

    <!-- Video -->
    <div
      v-else-if="isVideo"
      :key="localSrc"
    >
      <!-- Detect poster load failures; video poster attr does not emit reliable error events. -->
      <img
        v-if="localPosterSrc"
        :src="localPosterSrc"
        alt=""
        aria-hidden="true"
        class="sr-only"
        @error="onVideoPosterPreloadError"
      />

      <!-- TODO: Add load animation -->
      <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
      <video
        ref="mediaElement"
        v-intersection-observer="[onVideoIntersectionObserver, { rootMargin: '100px' }]"
        :height="mediaSrcHeightAttribute"
        :poster="localPosterSrc"
        :src="localSrc"
        :style="mediaAspectRatio ? `aspect-ratio: ${mediaAspectRatio};` : undefined"
        :width="mediaSrcWidthAttribute"
        class="h-auto w-full rounded-t-md"
        controls
        loop
        playsinline
        preload="none"
        @error="onVideoPlaybackError"
        @focus="initializeVideoPlayer"
        @pointerdown="initializeVideoPlayer"
        @pointerenter="initializeVideoPlayer"
      />
    </div>
  </div>
</template>
