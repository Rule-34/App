<script lang="ts" setup>
  import type { IPost, PostMediaType } from '~/assets/js/post.dto'
  import { vIntersectionObserver } from '@vueuse/components'
  import { proxyUrl } from '~/assets/js/proxy'
  import { getVideoAdSchedule, isEligiblePauseAd, shouldLoadVideoAds } from '~/assets/js/video-ad-policy'

  const localePath = useLocalePath()
  const { t } = useI18n()
  const { isPremium } = useUserData()
  const { autoplayAnimatedMedia } = useUserSettings()
  const { hasInteracted } = useInteractionDetector()
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
  type VideoJsPlayer = ReturnType<(typeof import('video.js'))['default']>
  type ImaPlugin = {
    changeAdTag(adTag: string): void
    initializeAdDisplayContainer(): void
    requestAds(): void
  }
  type VideoJsPlayerWithIma = VideoJsPlayer & { ima: ImaPlugin & ((options: Record<string, unknown>) => void) }

  const mediaElement = shallowRef<MediaElementRef>(null)
  const videoElementGeneration = shallowRef(0)

  const localSrc = shallowRef(props.mediaSrc ?? '')
  const localPosterSrc = shallowRef(props.mediaPosterSrc ?? undefined)

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

  const triedToLoadWithProxy = shallowRef(false)
  const triedToLoadPosterWithProxy = shallowRef(false)

  const IMA_SDK_URL = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js'
  const PRE_ROLL_AD_TAG = 'https://s.magsrv.com/splash.php?idzone=5386496'
  const PAUSE_ROLL_AD_TAG = 'https://s.magsrv.com/splash.php?idzone=5386214'
  const IMA_SDK_TIMEOUT = 5000

  let videoPlayer: VideoJsPlayerWithIma | undefined
  let videoPlayerInitPromise: Promise<void> | null = null
  let videoPlayerIdleScheduled = false
  let videoPlayerInitTimeout: number | null = null
  let isUnmounted = false
  let playerGeneration = 0
  let isVideoVisible = true
  let isProgrammaticPause = false
  let isAdActive = false
  let pauseAdWasRequested = false
  let pauseAdWasShown = false
  let videoAdSchedule: ReturnType<typeof getVideoAdSchedule> | null = null
  let adsInitPromise: Promise<void> | null = null
  let imaSdkPromise: Promise<void> | null = null

  const isAnimatedMediaLoading = ref(false)
  const isAnimatedMediaPlaying = ref(false)
  const mediaHasLoaded = ref(false)

  watch(hasInteracted, (hasInteracted) => {
    if (hasInteracted) {
      initializeVideoAds()?.catch(() => {})
    }
  })

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

  function loadImaSdk() {
    if (window.google?.ima) {
      return Promise.resolve()
    }

    if (imaSdkPromise) {
      return imaSdkPromise
    }

    imaSdkPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${IMA_SDK_URL}"]`)
      const script = existingScript ?? document.createElement('script')
      const timeoutId = window.setTimeout(() => finish(new Error('Google IMA SDK load timed out')), IMA_SDK_TIMEOUT)

      function finish(loadError?: Error) {
        window.clearTimeout(timeoutId)
        script.removeEventListener('load', onLoad)
        script.removeEventListener('error', onError)

        if (loadError || !window.google?.ima) {
          imaSdkPromise = null
          script.remove()
          reject(loadError ?? new Error('Google IMA SDK unavailable'))
          return
        }

        resolve()
      }

      function onLoad() {
        finish()
      }

      function onError() {
        finish(new Error('Google IMA SDK failed to load'))
      }

      script.addEventListener('load', onLoad, { once: true })
      script.addEventListener('error', onError, { once: true })

      if (!existingScript) {
        script.src = IMA_SDK_URL
        script.async = true
        document.head.append(script)
      }
    })

    return imaSdkPromise
  }

  async function initializeAds(
    player: VideoJsPlayerWithIma,
    generation: number,
    schedule: ReturnType<typeof getVideoAdSchedule>
  ) {
    await Promise.all([
      loadImaSdk(),
      import('videojs-contrib-ads'),
      import('videojs-ima'),
      import('videojs-ima/dist/videojs.ima.css')
    ])

    if (isUnmounted || generation !== playerGeneration || player.isDisposed()) {
      return
    }

    player.ima({
      adLabel: t('media.adText'),
      ...(schedule.preRoll ? { adTagUrl: PRE_ROLL_AD_TAG } : {}),
      adsRenderingSettings: { loadVideoTimeout: 3000 },
      autoPlayAdBreaks: true,
      contribAdsSettings: { timeout: 3500 },
      disableAdControls: false,
      disableCustomPlaybackForIOS10Plus: false,
      forceNonLinearFullSlot: false,
      numRedirects: 4,
      preventLateAdStart: true,
      showControlsForJSAds: false,
      showCountdown: true,
      vastLoadTimeout: 3000,
      vpaidMode: window.google!.ima!.ImaSdkSettings.VpaidMode.DISABLED
    })

    player.on('ads-ad-started', () => {
      isAdActive = true

      if (pauseAdWasRequested) {
        pauseAdWasShown = true
      }
    })
    player.on(['adended', 'adserror', 'adtimeout'], () => {
      isAdActive = false
      pauseAdWasRequested = false
    })
    player.on('pause', () => requestPauseAd(player, schedule))
  }

  function requestPauseAd(player: VideoJsPlayerWithIma, schedule: ReturnType<typeof getVideoAdSchedule>) {
    if (
      !schedule.pauseRoll ||
      !isEligiblePauseAd({
        isAdActive,
        isContentEnded: player.ended(),
        isProgrammatic: isProgrammaticPause,
        isRequestPending: pauseAdWasRequested,
        isVisible: isVideoVisible,
        wasShown: pauseAdWasShown
      })
    ) {
      return
    }

    pauseAdWasRequested = true

    try {
      player.ima.changeAdTag(PAUSE_ROLL_AD_TAG)
      player.ima.requestAds()
    } catch {
      isAdActive = false
      pauseAdWasRequested = false
    }
  }

  function initializeVideoAds() {
    if (adsInitPromise || !hasInteracted.value || !videoPlayer || !videoAdSchedule) {
      return adsInitPromise
    }

    const generation = playerGeneration
    adsInitPromise = initializeAds(videoPlayer, generation, videoAdSchedule).finally(() => {
      adsInitPromise = null
    })

    return adsInitPromise
  }

  async function createVideoPlayer() {
    const videoElement = getVideoElement()

    if (!videoElement || !isVideo.value) {
      throw new Error('Video element not found')
    }

    const generation = ++playerGeneration
    const videoCount = isPremium.value ? timesVideoHasRendered.value : ++timesVideoHasRendered.value
    const schedule = getVideoAdSchedule(videoCount)
    const shouldLoadAds = shouldLoadVideoAds(isPremium.value, schedule)
    const [{ default: videojs }] = await Promise.all([import('video.js'), import('video.js/dist/video-js.css')])

    if (isUnmounted || generation !== playerGeneration || getVideoElement() !== videoElement) {
      return
    }

    const player = videojs(videoElement, {
      controls: true,
      fluid: true,
      loop: true,
      playbackRates: [0.25, 0.5, 0.75, 1, 1.5, 2],
      playsinline: true,
      preload: 'none',
      responsive: true,
      sources: [{ src: localSrc.value, type: 'video/mp4' }]
    }) as VideoJsPlayerWithIma

    videoPlayer = player

    if (shouldLoadAds) {
      videoAdSchedule = schedule
      initializeVideoAds()?.catch(() => {})
    }
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
    playerGeneration++

    if (!videoPlayer) {
      return
    }

    videoPlayer.dispose()
    videoPlayer = undefined
    videoElementGeneration.value++
    videoAdSchedule = null
    adsInitPromise = null
    isAdActive = false
    pauseAdWasRequested = false
    pauseAdWasShown = false
  }

  function onVideoUserInteraction() {
    videoPlayer?.ima?.initializeAdDisplayContainer?.()
    initializeVideoPlayer()
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

    // Proxy videos
    if (
      isVideo.value &&
      isPremium.value &&
      //
      !triedToLoadWithProxy.value
    ) {
      localSrc.value = proxyUrl(localSrc.value)

      reloadVideoPlayer(true)

      triedToLoadWithProxy.value = true
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

  function manuallyReloadMedia() {
    // Reset state
    triedToLoadWithProxy.value = false
    triedToLoadPosterWithProxy.value = false
    error.value = null

    // Reload media
    localSrc.value = props.mediaSrc ?? ''
    localPosterSrc.value = props.mediaPosterSrc ?? undefined

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

    isVideoVisible = entry.isIntersecting

    if (entry.isIntersecting) {
      scheduleVideoPlayerInitialization(isLikelyLcpMedia.value ? 1200 : 1600)
      return
    }

    if (!entry.isIntersecting && videoPlayer) {
      isProgrammaticPause = true
      videoPlayer.pause()
      window.setTimeout(() => {
        isProgrammaticPause = false
      })
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
      :key="`${localSrc}-${videoElementGeneration}`"
    >
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
        class="video-js h-auto w-full rounded-t-md"
        controls
        loop
        playsinline
        preload="none"
        @error="onMediaError"
        @focus="onVideoUserInteraction"
        @pointerdown="onVideoUserInteraction"
        @pointerenter="initializeVideoPlayer"
      />
    </div>
  </div>
</template>
