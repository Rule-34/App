<script lang="ts" setup>
  import type { IPost, PostMediaType } from '~/assets/js/post.dto'
  import { vIntersectionObserver } from '@vueuse/components'
  import { ArrowPathIcon, ArrowTopRightOnSquareIcon, SparklesIcon, XMarkIcon } from '@heroicons/vue/20/solid'
  import {
    cleanMediaUrl,
    getCandidateSources,
    getMediaReferrerPolicy,
    isDomainDirectBlocked,
    onDomainHealthChange,
    recordDirectFailure,
    recordDirectSuccess,
    resetDomainBreaker,
    type MediaReferrerPolicy
  } from '~/assets/js/media-resilience'

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

  const rawMediaSrc = computed(() => cleanMediaUrl(props.mediaSrc) ?? '')
  const rawPosterSrc = computed(() => cleanMediaUrl(props.mediaPosterSrc) ?? '')

  /**
   * Safe media URL for iframe embedding and external link navigation.
   * Media URLs are cleaned and validated upstream (ensuring valid http/https and stripping fragments).
   */
  const safeRawMediaSrc = computed(() => rawMediaSrc.value)

  const isImage = computed(() => props.mediaType === 'image')

  /**
   * Identifies whether Candidate index 0 is rendered via the server-side imgproxy service
   * (used for premium users and early SSR posts) rather than directly fetching from the origin booru.
   */
  const isIndexZeroViaImgproxy = computed(
    () => isImage.value && (isPremium.value || (wasCurrentPageSSR.value && props.postIndex < 8))
  )

  /**
   * Identifies whether the active media request is an unproxied, direct fetch to the origin booru.
   */
  const isDirectRequest = computed(() => srcCandidateIndex.value === 0 && !isIndexZeroViaImgproxy.value)

  const domainHealthVersion = shallowRef(0)

  let posterProbeToken = 0
  let isUnmounted = false
  let activeProbe: HTMLImageElement | null = null

  let unsubscribeHealthChange: (() => void) | null = null

  onMounted(() => {
    unsubscribeHealthChange = onDomainHealthChange(() => {
      domainHealthVersion.value += 1
    })
    probeVideoPoster()
  })

  const isDirectBlocked = computed(() => {
    void domainHealthVersion.value
    return isDomainDirectBlocked(rawMediaSrc.value, props.mediaType)
  })

  const isPosterDirectBlocked = computed(() => {
    void domainHealthVersion.value
    if (!rawPosterSrc.value) return false
    return isDomainDirectBlocked(rawPosterSrc.value, 'image')
  })

  const srcCandidates = computed(() =>
    getCandidateSources({
      rawUrl: rawMediaSrc.value,
      mediaType: props.mediaType,
      isPremium: isPremium.value
    })
  )

  const posterCandidates = computed(() =>
    getCandidateSources({
      rawUrl: rawPosterSrc.value,
      mediaType: 'image',
      isPremium: isPremium.value
    })
  )

  const initialSrcIndex =
    !isIndexZeroViaImgproxy.value && isDirectBlocked.value && srcCandidates.value.length > 1 ? 1 : 0
  const initialPosterIndex = isPosterDirectBlocked.value && posterCandidates.value.length > 1 ? 1 : 0

  const srcCandidateIndex = shallowRef(initialSrcIndex)
  const posterCandidateIndex = shallowRef(initialPosterIndex)

  const localSrc = shallowRef(srcCandidates.value[initialSrcIndex] ?? rawMediaSrc.value)
  const localPosterSrc = shallowRef(posterCandidates.value[initialPosterIndex] ?? props.mediaPosterSrc ?? undefined)

  const mediaReferrerPolicy = computed(() => getMediaReferrerPolicy(localSrc.value))
  const posterReferrerPolicy = computed(() => getMediaReferrerPolicy(localPosterSrc.value))
  const videoReferrerPolicy = computed<MediaReferrerPolicy>(() => {
    const mediaPolicy = mediaReferrerPolicy.value
    const posterPolicy = posterReferrerPolicy.value

    if (mediaPolicy === 'origin' || posterPolicy === 'origin') {
      return 'origin'
    }

    if (mediaPolicy === 'no-referrer' || posterPolicy === 'no-referrer') {
      return 'no-referrer'
    }

    return 'strict-origin-when-cross-origin'
  })

  function probeVideoPoster() {
    if (import.meta.server || isUnmounted || !isVideo.value || !posterCandidates.value.length) {
      return
    }

    posterProbeToken += 1
    const currentToken = posterProbeToken

    if (activeProbe) {
      activeProbe.onload = null
      activeProbe.onerror = null
      activeProbe.src = ''
      activeProbe = null
    }

    const candidateIdx = posterCandidateIndex.value

    function probeCandidate(idx: number) {
      if (isUnmounted || currentToken !== posterProbeToken || idx >= posterCandidates.value.length) {
        return
      }

      const candidateUrl = posterCandidates.value[idx]
      if (!candidateUrl) return

      const probe = new Image()
      activeProbe = probe
      probe.referrerPolicy = getMediaReferrerPolicy(candidateUrl)

      probe.onload = () => {
        if (isUnmounted || currentToken !== posterProbeToken) return
        activeProbe = null
        posterCandidateIndex.value = idx
        localPosterSrc.value = candidateUrl
        if (idx === 0 && rawPosterSrc.value) {
          recordDirectSuccess(rawPosterSrc.value, 'image')
        }
      }

      probe.onerror = () => {
        if (isUnmounted || currentToken !== posterProbeToken) return
        activeProbe = null
        if (idx === 0 && !isPosterDirectBlocked.value && rawPosterSrc.value) {
          recordDirectFailure(rawPosterSrc.value, 'image')
        }
        const nextIdx = idx + 1
        if (nextIdx < posterCandidates.value.length) {
          probeCandidate(nextIdx)
        }
      }

      probe.src = candidateUrl
    }

    probeCandidate(candidateIdx)
  }

  const useIframePlayer = shallowRef(false)

  // When domain breaker trips while cards are mounted, uncompleted direct requests advance to Candidate 1 (Photon)
  watch(isDirectBlocked, (blocked) => {
    if (blocked && !mediaHasLoaded.value && !hasError.value && !isIndexZeroViaImgproxy.value) {
      if (srcCandidateIndex.value === 0 && srcCandidates.value.length > 1 && srcCandidates.value[1]) {
        srcCandidateIndex.value = 1
        localSrc.value = srcCandidates.value[1]
        if (isVideo.value) {
          reloadVideoPlayer(false)
        }
      }
    }
  })

  watch(isPosterDirectBlocked, (blocked) => {
    if (blocked) {
      if (posterCandidateIndex.value === 0 && posterCandidates.value.length > 1 && posterCandidates.value[1]) {
        posterCandidateIndex.value = 1
        localPosterSrc.value = posterCandidates.value[1]
      }
    }
  })

  watch([() => props.mediaSrc, () => props.mediaPosterSrc], () => {
    const newSrcIdx = !isIndexZeroViaImgproxy.value && isDirectBlocked.value && srcCandidates.value.length > 1 ? 1 : 0
    const newPosterIdx = isPosterDirectBlocked.value && posterCandidates.value.length > 1 ? 1 : 0
    srcCandidateIndex.value = newSrcIdx
    posterCandidateIndex.value = newPosterIdx
    useIframePlayer.value = false
    mediaHasLoaded.value = false
    error.value = null
    localSrc.value = srcCandidates.value[newSrcIdx] ?? rawMediaSrc.value
    localPosterSrc.value = posterCandidates.value[newPosterIdx] ?? props.mediaPosterSrc ?? undefined
    probeVideoPoster()
  })

  const error = ref<Error | null>(null)
  const hasError = computed(() => error.value !== null)

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
  const isShortMedia = computed(() => {
    if (!props.mediaSrcWidth || !props.mediaSrcHeight) {
      return false
    }

    return props.mediaSrcWidth / props.mediaSrcHeight >= 1.15
  })
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

    if (unsubscribeHealthChange) {
      unsubscribeHealthChange()
      unsubscribeHealthChange = null
    }

    if (activeProbe) {
      activeProbe.onload = null
      activeProbe.onerror = null
      activeProbe = null
    }

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

    if (!initializedVideoElement.querySelector('source') && localSrc.value) {
      const sourceElement = document.createElement('source')
      sourceElement.src = localSrc.value
      initializedVideoElement.appendChild(sourceElement)
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

    // TODO: Handle poster error
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

    const targetElement = payload.target as HTMLElement | null
    const isImage = targetElement instanceof HTMLImageElement || targetElement?.tagName === 'IMG'
    const isVideoTag = targetElement instanceof HTMLVideoElement || targetElement?.tagName === 'VIDEO'
    const target = (isImage || isVideoTag ? targetElement : null) as HTMLImageElement | HTMLVideoElement | null

    if (!target?.src) {
      return
    }

    // Ignore bogus /null src generated when video players reset on loop/end
    if (isVideoTag && target.src.endsWith('/null')) {
      if (localSrc.value && !localSrc.value.endsWith('/null')) {
        target.src = localSrc.value
      }
      return
    }

    // Never treat post-playback completion events on videos as media load failures
    if (isVideoTag && (target as HTMLVideoElement).ended) {
      return
    }

    // Reset loading state if there's an error with GIF
    if (isAnimatedMedia.value && isAnimatedMediaPlaying.value) {
      isAnimatedMediaLoading.value = false
    }

    // Case 1: The poster image failed to load for animated media
    if (isAnimatedMedia.value && !isAnimatedMediaPlaying.value && target.src === localPosterSrc.value) {
      if (posterCandidateIndex.value === 0 && !isPosterDirectBlocked.value && rawPosterSrc.value) {
        recordDirectFailure(rawPosterSrc.value, 'image')
      }

      posterCandidateIndex.value += 1
      const nextPoster = posterCandidates.value[posterCandidateIndex.value]
      if (nextPoster) {
        localPosterSrc.value = nextPoster
        return
      }

      error.value = new Error(t('errors.mediaLoadError'))
      return
    }

    // Case 2: Main media failed to load (image, gif, or video)
    // If Candidate 0 (direct request) failed, record failure for the domain
    if (isDirectRequest.value && !isDirectBlocked.value) {
      recordDirectFailure(rawMediaSrc.value, props.mediaType)
    }

    srcCandidateIndex.value += 1
    const nextSrc = srcCandidates.value[srcCandidateIndex.value]
    if (nextSrc) {
      localSrc.value = nextSrc

      if (isVideo.value) {
        reloadVideoPlayer(true)
      }
      return
    }

    if (
      isVideo.value &&
      posterCandidateIndex.value === 0 &&
      posterCandidates.value.length > 1 &&
      posterCandidates.value[1]
    ) {
      posterCandidateIndex.value = 1
      localPosterSrc.value = posterCandidates.value[1]
    }

    error.value = new Error(t('errors.mediaLoadError'))
  }

  const isRetrying = shallowRef(false)

  function manuallyReloadMedia() {
    if (isRetrying.value) return
    isRetrying.value = true

    resetDomainBreaker(rawMediaSrc.value, props.mediaType)
    if (rawPosterSrc.value) {
      resetDomainBreaker(rawPosterSrc.value, 'image')
    }

    srcCandidateIndex.value = 0
    useIframePlayer.value = false
    mediaHasLoaded.value = false
    error.value = null

    // Force retry direct request
    localSrc.value = rawMediaSrc.value

    if (isVideo.value) {
      if (isPosterDirectBlocked.value && posterCandidates.value.length > 1 && posterCandidates.value[1]) {
        posterCandidateIndex.value = 1
        localPosterSrc.value = posterCandidates.value[1]
      } else {
        posterCandidateIndex.value = 0
        localPosterSrc.value = rawPosterSrc.value || props.mediaPosterSrc || undefined
        nextTick(() => {
          probeVideoPoster()
        })
      }
    } else {
      posterCandidateIndex.value = 0
      localPosterSrc.value = rawPosterSrc.value || props.mediaPosterSrc || undefined
    }

    if (isVideo.value) {
      nextTick(async () => {
        await reloadVideoPlayer()
        // Prompt browser to fetch media stream on retry
        getVideoElement()?.load()
      })
    }

    setTimeout(() => {
      isRetrying.value = false
    }, 600)
  }

  function playInIframe() {
    useIframePlayer.value = true
    error.value = null
  }

  function closeIframePlayer() {
    useIframePlayer.value = false
    error.value = new Error(t('errors.mediaLoadError'))
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

    const isShowingPoster = isAnimatedMedia.value && !isAnimatedMediaPlaying.value
    const activeSrc = isShowingPoster ? localPosterSrc.value : localSrc.value
    const rawTargetSrc = isShowingPoster ? rawPosterSrc.value || props.mediaPosterSrc : rawMediaSrc.value

    if (activeSrc && activeSrc === rawTargetSrc && (isShowingPoster || isDirectRequest.value)) {
      recordDirectSuccess(rawTargetSrc, isShowingPoster ? 'image' : props.mediaType)
    }

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
    <!-- Error Overlay -->
    <template v-if="hasError">
      <div
        :class="isShortMedia ? 'px-4 py-4 sm:px-5 sm:py-4.5' : 'px-4 py-6 sm:px-6 sm:py-8'"
        :style="mediaAspectRatio ? `aspect-ratio: ${mediaAspectRatio};` : undefined"
        class="relative flex h-full min-h-[200px] w-full flex-col items-center justify-center overflow-hidden rounded-t-md bg-linear-to-b from-base-900/60 via-base-950 to-base-1000 text-center select-none"
      >
        <div
          :class="isShortMedia ? 'gap-3 sm:gap-3.5' : 'gap-4 sm:gap-5'"
          class="relative z-10 flex w-full max-w-sm flex-col items-center justify-center"
        >
          <!-- Error Title & Concise Context Subtitle -->
          <div class="flex flex-col items-center space-y-1 text-center">
            <h3 class="text-base font-semibold tracking-wide text-base-content-highlight">
              {{ error?.message || t('errors.mediaLoadError') }}
            </h3>
            <p class="max-w-[300px] text-xs text-base-content/80">
              {{ t('media.hostBlocksDirectAccess') }}
            </p>
          </div>

          <!-- Actions -->
          <div class="w-full">
            <!-- Compact Video Actions (Landscape / Short Cards: Single Row) -->
            <div
              v-if="isVideo && isShortMedia"
              class="flex w-full items-center gap-2"
            >
              <!-- Primary CTA: Play in Sandbox -->
              <button
                v-if="safeRawMediaSrc"
                class="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-md bg-primary-700 px-3 py-1.5 text-sm font-semibold text-base-content-highlight shadow-sm transition-colors hover:bg-primary-600 hover:hover-text-util focus-visible:focus-outline-util active:bg-primary-800"
                type="button"
                @click="playInIframe"
              >
                <span class="truncate">{{ t('media.playInSandbox') }}</span>
              </button>

              <!-- Open in new tab (icon button) -->
              <a
                v-if="safeRawMediaSrc"
                :aria-label="t('tags.openInNewTab')"
                :href="safeRawMediaSrc"
                :title="t('tags.openInNewTab')"
                class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-md px-2.5 py-1.5 text-base-content ring-1 ring-base-0/20 transition-colors hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                rel="noopener noreferrer"
                target="_blank"
              >
                <ArrowTopRightOnSquareIcon
                  class="h-4 w-4 shrink-0 text-base-content"
                  aria-hidden="true"
                />
              </a>

              <!-- Try Again (icon button for compact mode) -->
              <button
                :aria-label="t('media.tryAgain')"
                :title="t('media.tryAgain')"
                :disabled="isRetrying"
                :class="isRetrying ? 'cursor-wait opacity-60' : ''"
                class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-md px-2.5 py-1.5 text-base-content ring-1 ring-base-0/20 transition-colors hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                type="button"
                @click="manuallyReloadMedia"
              >
                <ArrowPathIcon
                  class="h-4 w-4 shrink-0 text-base-content"
                  aria-hidden="true"
                />
              </button>
            </div>

            <!-- Expanded Video Actions (Portrait / Tall Cards: Two Tiers) -->
            <div
              v-else-if="isVideo"
              class="flex w-full flex-col gap-2.5"
            >
              <!-- Video Primary CTA: Play in Sandbox -->
              <button
                v-if="safeRawMediaSrc"
                class="inline-flex min-h-[40px] w-full items-center justify-center rounded-md bg-primary-700 px-4 py-2 text-sm font-semibold text-base-content-highlight shadow-sm transition-colors hover:bg-primary-600 hover:hover-text-util focus-visible:focus-outline-util active:bg-primary-800"
                type="button"
                @click="playInIframe"
              >
                {{ t('media.playInSandbox') }}
              </button>

              <!-- Video Secondary Actions Row (subordinated, compact) -->
              <div class="flex w-full items-center gap-2.5">
                <!-- Open in new tab -->
                <a
                  v-if="safeRawMediaSrc"
                  :href="safeRawMediaSrc"
                  class="inline-flex min-h-[32px] flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-base-content ring-1 ring-base-0/20 transition-colors hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ArrowTopRightOnSquareIcon
                    class="h-3.5 w-3.5 shrink-0 text-base-content"
                    aria-hidden="true"
                  />
                  <span class="truncate">{{ t('tags.openInNewTab') }}</span>
                </a>

                <!-- Try Again (No icon) -->
                <button
                  :disabled="isRetrying"
                  :class="isRetrying ? 'cursor-wait opacity-60' : ''"
                  class="inline-flex min-h-[32px] flex-1 items-center justify-center rounded-md px-3 py-1.5 text-xs text-base-content ring-1 ring-base-0/20 transition-colors hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                  type="button"
                  @click="manuallyReloadMedia"
                >
                  <span class="truncate">{{ t('media.tryAgain') }}</span>
                </button>
              </div>
            </div>

            <!-- Compact Image Actions (Landscape / Short Cards: Single Row) -->
            <div
              v-else-if="isShortMedia"
              class="flex w-full items-center gap-2"
            >
              <!-- Try Again -->
              <button
                :disabled="isRetrying"
                :class="isRetrying ? 'cursor-wait opacity-60' : ''"
                class="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-md bg-primary-700 px-3 py-1.5 text-sm font-semibold text-base-content-highlight transition-colors hover:bg-primary-600 hover:hover-text-util focus-visible:focus-outline-util active:bg-primary-800"
                type="button"
                @click="manuallyReloadMedia"
              >
                <span>{{ t('media.tryAgain') }}</span>
              </button>

              <!-- Open in new tab (icon button) -->
              <a
                v-if="safeRawMediaSrc"
                :aria-label="t('tags.openInNewTab')"
                :href="safeRawMediaSrc"
                :title="t('tags.openInNewTab')"
                class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-md px-2.5 py-1.5 text-base-content ring-1 ring-base-0/20 transition-colors hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                rel="noopener noreferrer"
                target="_blank"
              >
                <ArrowTopRightOnSquareIcon
                  class="h-4 w-4 shrink-0 text-base-content"
                  aria-hidden="true"
                />
              </a>
            </div>

            <!-- Expanded Image Actions Row -->
            <div
              v-else
              class="flex w-full items-center gap-2.5"
            >
              <!-- Try Again (No icon) -->
              <button
                :disabled="isRetrying"
                :class="isRetrying ? 'cursor-wait opacity-60' : ''"
                class="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-md bg-primary-700 px-3 py-1.5 text-sm font-semibold text-base-content-highlight transition-colors hover:bg-primary-600 hover:hover-text-util focus-visible:focus-outline-util active:bg-primary-800"
                type="button"
                @click="manuallyReloadMedia"
              >
                <span>{{ t('media.tryAgain') }}</span>
              </button>

              <!-- Open in new tab -->
              <a
                v-if="safeRawMediaSrc"
                :href="safeRawMediaSrc"
                class="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-base-content ring-1 ring-base-0/20 transition-colors hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                rel="noopener noreferrer"
                target="_blank"
              >
                <ArrowTopRightOnSquareIcon
                  class="h-3.5 w-3.5 shrink-0 text-base-content"
                  aria-hidden="true"
                />
                <span class="truncate">{{ t('tags.openInNewTab') }}</span>
              </a>
            </div>
          </div>

          <!-- Premium promotion (100% inline text flow with SparklesIcon) -->
          <p
            v-if="!isPremium"
            class="text-center text-xs leading-relaxed text-base-content"
          >
            <SparklesIcon
              class="mr-1.5 inline-block h-3.5 w-3.5 align-[-2px] text-accent-400"
              aria-hidden="true"
            />
            <NuxtLink
              :href="localePath('/premium?utm_source=internal&utm_medium=media-error#pricing')"
              class="font-medium underline hover:hover-text-util focus-visible:focus-outline-util"
              >{{ t('media.getPremium') }}</NuxtLink
            >{{ ' ' }}<span>{{ t('media.toBypassBlocks') }}</span>
          </p>
        </div>
      </div>
    </template>

    <!-- Iframe fallback for videos -->
    <div
      v-else-if="useIframePlayer"
      :style="mediaAspectRatio ? `aspect-ratio: ${mediaAspectRatio};` : undefined"
      class="group relative flex h-full min-h-[200px] w-full flex-col items-center justify-center overflow-hidden rounded-t-md bg-base-950"
    >
      <!-- Minimal close control to return to error overlay -->
      <button
        :aria-label="t('common.close') || 'Close'"
        class="absolute top-2.5 right-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-base-950/80 text-base-content ring-1 ring-base-0/20 backdrop-blur-md transition-colors hover:bg-base-900 hover:text-base-content-highlight focus-visible:focus-outline-util"
        type="button"
        @click="closeIframePlayer"
      >
        <XMarkIcon
          class="h-4 w-4"
          aria-hidden="true"
        />
      </button>

      <iframe
        :src="safeRawMediaSrc"
        :height="mediaSrcHeightAttribute"
        :width="mediaSrcWidthAttribute"
        :title="mediaAlt || 'Video Player'"
        class="block h-full w-full rounded-t-md border-0 bg-base-1000"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowfullscreen
        loading="lazy"
        :referrerpolicy="getMediaReferrerPolicy(safeRawMediaSrc)"
        sandbox="allow-same-origin"
      />
    </div>

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
          v-if="srcCandidateIndex === 0"
          ref="mediaElement"
          :alt="mediaAlt"
          :decoding="mediaDecoding"
          :height="mediaSrcHeightAttribute"
          :img-attrs="
            {
              class: 'h-auto w-full rounded-t-md',
              style: mediaAspectRatio ? 'aspect-ratio: ' + mediaAspectRatio : undefined,
              fetchpriority: mediaFetchPriority,
              referrerpolicy: mediaReferrerPolicy
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
          :referrerpolicy="mediaReferrerPolicy"
          @error="onMediaError"
          @load="onMediaLoad"
        />
      </template>

      <!-- Regular images for non-premium users -->
      <template v-else>
        <!-- SSR + first posts: imgproxy keeps crawler/LCP images optimized. -->
        <NuxtPicture
          v-if="wasCurrentPageSSR && postIndex < 8 && srcCandidateIndex === 0"
          ref="mediaElement"
          :alt="mediaAlt"
          :decoding="mediaDecoding"
          :height="mediaSrcHeightAttribute"
          :img-attrs="
            {
              class: 'h-auto w-full rounded-t-md',
              style: mediaAspectRatio ? 'aspect-ratio: ' + mediaAspectRatio : undefined,
              fetchpriority: mediaFetchPriority,
              referrerpolicy: mediaReferrerPolicy
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
          :referrerpolicy="mediaReferrerPolicy"
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
        :referrerpolicy="isAnimatedMediaPlaying ? mediaReferrerPolicy : posterReferrerPolicy"
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
        :referrerpolicy="videoReferrerPolicy"
        @error="onMediaError"
        @loadeddata="onMediaLoad"
        @focus="initializeVideoPlayer"
        @pointerdown="initializeVideoPlayer"
        @pointerenter="initializeVideoPlayer"
      />
    </div>
  </div>
</template>
