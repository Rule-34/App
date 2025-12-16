<script lang="ts" setup>
  import type { IPost } from '~/assets/js/post.dto'
  import { vIntersectionObserver } from '@vueuse/components'
  import { proxyUrl } from 'assets/js/proxy'

  const { isPremium } = useUserData()
  const { autoplayAnimatedMedia, autoplayVideos } = useUserSettings()
  let { timesVideoHasRendered } = useEthics()
  const { wasCurrentPageSSR } = useSSRDetection()
  const { hasInteracted } = useInteractionDetector()

  const instance = getCurrentInstance()
  const componentId = instance!.uid

  export interface PostMediaProps {
    postIndex: number

    mediaSrc: IPost['high_res_file']['url']
    mediaSrcHeight: IPost['high_res_file']['height'] | null
    mediaSrcWidth: IPost['high_res_file']['width'] | null
    mediaPosterSrc: string | null
    mediaType: IPost['media_type']
    mediaAlt: string
  }

  const props = defineProps<PostMediaProps>()

  const mediaElement = ref<HTMLElement | null>(null)

  const localSrc = shallowRef(props.mediaSrc)
  const localPosterSrc = shallowRef(props.mediaPosterSrc)

  const error = ref<Error | null>(null)
  const hasError = computed(() => error.value !== null)

  const isImage = computed(() => props.mediaType === 'image')
  const isVideo = computed(() => props.mediaType === 'video')
  const isAnimatedMedia = computed(
    () => props.mediaType === 'animated' || (props.mediaType === 'image' && props.mediaSrc.endsWith('.gif'))
  )

  const triedToLoadWithProxy = shallowRef(false)
  const triedToLoadPosterWithProxy = shallowRef(false)

  const isAnimatedMediaLoading = ref(false)
  const isAnimatedMediaPlaying = ref(false)
  const mediaHasLoaded = ref(false)

  const { activeVideoId, updateCandidate } = useFeedAutoplay()

  onMounted(() => {
    if (!mediaElement.value) {
      return
    }

    switch (true) {
      case isVideo.value:
        break

      case isAnimatedMedia.value:
        if (autoplayAnimatedMedia.value && !isAnimatedMediaPlaying.value) {
          startPlayingAnimatedMedia()
        }
        break
    }
  })

  onBeforeUnmount(() => {
    updateCandidate(componentId, null, false)

    let finalMediaElement = mediaElement.value

    if (finalMediaElement == null) {
      return
    }

    if (isImage.value || isAnimatedMedia.value) {
      // If its a Vue component, get the actual element
      if ('$el' in finalMediaElement) {
        finalMediaElement = finalMediaElement.$el as HTMLElement
      }

      // If its a picture, get the img element
      if (finalMediaElement.tagName === 'PICTURE') {
        finalMediaElement = finalMediaElement.querySelector('img') as HTMLImageElement
      }

      // Cancel any pending media requests - https://stackoverflow.com/a/28060352
      finalMediaElement.removeAttribute('src')
    }
  })

  function reloadVideoPlayer(shouldPlay: boolean = false) {
    if (shouldPlay) {
      nextTick(() => {
        const video = mediaElement.value as HTMLVideoElement | null
        video?.play()
      })
    }
  }

  function startPlayingAnimatedMedia() {
    isAnimatedMediaLoading.value = true
    isAnimatedMediaPlaying.value = true
  }

  function onMediaError(event: Event) {
    if (hasError.value) {
      return
    }

    const target = event.target as HTMLImageElement | HTMLVideoElement | null

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
      localSrc.value = proxyUrl(props.mediaSrc)

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
        localPosterSrc.value = proxyUrl(props.mediaPosterSrc)

        triedToLoadPosterWithProxy.value = true
        return
      }

      // Case 2: The actual GIF failed to load
      if (
        isAnimatedMediaPlaying.value &&
        //
        !triedToLoadWithProxy.value
      ) {
        localSrc.value = proxyUrl(props.mediaSrc)

        triedToLoadWithProxy.value = true
        return
      }
    }

    error.value = new Error('Error loading media')
  }

  function manuallyReloadMedia() {
    // Reset state
    triedToLoadWithProxy.value = false
    triedToLoadPosterWithProxy.value = false
    error.value = null

    // Reload media
    localSrc.value = props.mediaSrc
    localPosterSrc.value = props.mediaPosterSrc

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
    updateCandidate(componentId, mediaElement.value, entry.isIntersecting)
  }

  // Watch for active video changes to play/pause accordingly
  watch(activeVideoId, (newId) => {
    if (!isVideo.value || !mediaElement.value || !autoplayVideos.value) {
      return
    }

    const video = mediaElement.value as HTMLVideoElement

    if (newId === componentId) {
      console.debug('Autoplaying video', props.postIndex)

      // If user hasn't interacted with the page yet, force mute to ensure autoplay works
      // and to avoid blasting sound unexpectedly
      const playPromise = video.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Auto-play was prevented
          // AbortError is expected when scrolling fast
          if (error.name !== 'AbortError') {
            console.error('Error playing video:', error)
          }
        })
      }
    } else {
      video.pause()
    }
  })

  function onMediaLoad(event: Event) {
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

    if (!mediaElement.value) {
      return
    }

    if (!mediaElement.value.complete) {
      return
    }

    mediaHasLoaded.value = true
  })
</script>

<template>
  <div :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`">
    <!-- Error -->
    <template v-if="hasError">
      <div class="flex h-full flex-col items-center space-y-4 py-4">
        <div class="flex flex-1 flex-col items-center justify-center gap-4">
          <span
            class="from-base-950 via-base-900 to-base-900 text-base-content-highlight rounded-md bg-linear-to-l px-4 py-1.5 text-center"
          >
            {{ error?.message }}
          </span>

          <button
            class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 mx-auto inline-flex items-center justify-center rounded-md px-2 py-1 text-sm ring-1"
            type="button"
            @click="manuallyReloadMedia"
          >
            Try again?
          </button>
        </div>

        <!-- Premium promotion -->
        <!-- TODO: Improve style -->
        <div
          v-if="!isPremium"
          class="text-base-content text-xs"
        >
          <NuxtLink
            class="hover:hover-text-util focus-visible:focus-outline-util underline"
            href="/premium?utm_source=internal&utm_medium=media-error"
          >
            <!-- @formatter:off -->
            Get Premium</NuxtLink
          >

          <span> to bypass website blocks</span>
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
          :decoding="postIndex < 3 ? undefined : 'async'"
          :height="mediaSrcHeight"
          :imgAttrs="{
            class: 'h-auto w-full rounded-t-md',
            style: 'aspect-ratio: ' + mediaSrcWidth + '/' + mediaSrcHeight,
            fetchpriority: postIndex < 3 ? 'high' : undefined
          }"
          :loading="postIndex < 3 ? undefined : 'lazy'"
          :preload="postIndex < 8"
          :src="localSrc"
          :width="mediaSrcWidth"
          provider="imgproxy"
          @error="onMediaError"
          @load="onMediaLoad"
        />
      </template>

      <!-- Regular images for non-premium users -->
      <template v-else>
        <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
        <NuxtImg
          ref="mediaElement"
          :alt="mediaAlt"
          :decoding="postIndex < 3 ? undefined : 'async'"
          :fetchpriority="postIndex < 3 ? 'high' : undefined"
          :height="mediaSrcHeight"
          :loading="postIndex < 3 ? undefined : 'lazy'"
          :preload="postIndex < 8"
          :src="localSrc"
          :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`"
          :width="mediaSrcWidth"
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
        :decoding="postIndex < 3 ? undefined : 'async'"
        :fetchpriority="postIndex < 3 ? 'high' : undefined"
        :height="mediaSrcHeight"
        :loading="postIndex < 3 ? undefined : 'lazy'"
        :preload="postIndex < 8"
        :src="isAnimatedMediaPlaying ? localSrc : localPosterSrc"
        :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`"
        :width="mediaSrcWidth"
        class="h-auto w-full rounded-t-md"
        @error="onMediaError"
        @load="onMediaLoad"
      />

      <!-- Loading indicator for GIFs -->
      <div
        v-if="isAnimatedMediaLoading && isAnimatedMediaPlaying"
        class="absolute inset-0 flex items-center justify-center rounded-t-md bg-black/20"
      >
        <span class="sr-only"> Loading media&hellip; </span>

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
            ></circle>
            <path
              class="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            ></path>
          </svg>
        </span>
      </div>

      <!-- Play button overlay - only shown when GIF is not playing -->
      <button
        v-if="!isAnimatedMediaPlaying"
        aria-label="Play"
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
        v-intersection-observer="[onVideoIntersectionObserver, { threshold: 0.2 }]"
        :height="mediaSrcHeight"
        :poster="localPosterSrc"
        :preload="autoplayVideos ? 'metadata' : 'none'"
        :muted="!hasInteracted"
        :src="localSrc"
        :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`"
        :width="mediaSrcWidth"
        class="h-auto w-full rounded-t-md"
        controls
        loop
        playsinline
        @error="onMediaError"
      />
    </div>
  </div>
</template>
