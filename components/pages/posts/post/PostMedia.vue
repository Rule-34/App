<script lang="ts" setup>
  import type { IPost } from '~/assets/js/post.dto'
  import { vIntersectionObserver } from '@vueuse/components'
  import fluidPlayer from 'fluid-player'
  import 'fluid-player/src/css/fluidplayer.css'
  import { proxyUrl } from 'assets/js/proxy'

  const { isPremium } = useUserData()
  let { timesVideoHasRendered } = useEthics()

  export interface PostMediaProps {
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

  const isAnimatedMediaPlaying = ref(false)
  const mediaHasLoaded = ref(false)

  const error = ref<Error | null>(null)
  const hasError = computed(() => error.value !== null)

  const isImage = computed(() => props.mediaType === 'image')
  const isVideo = computed(() => props.mediaType === 'video')
  const isGif = computed(
    () => props.mediaType === 'animated' || (props.mediaType === 'image' && props.mediaSrc.endsWith('.gif'))
  )

  const triedToLoadWithProxy = shallowRef(false)
  const triedToLoadPosterWithProxy = shallowRef(false)

  let videoPlayer: FluidPlayerInstance | undefined

  onMounted(() => {
    if (!mediaElement.value) {
      return
    }

    if (!isVideo.value) {
      return
    }

    createVideoPlayer()
  })

  onBeforeUnmount(() => {
    let finalMediaElement = mediaElement.value

    if (finalMediaElement == null) {
      return
    }

    if (isImage.value || isGif.value) {
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

    //
    else if (isVideo.value) {
      destroyVideoPlayer()
    }
  })

  function createVideoPlayer() {
    if (!mediaElement.value) {
      throw new Error('Media element not found')
    }

    if (!isVideo.value) {
      throw new Error('Media is not a video')
    }

    const fluidPlayerOptions: Partial<FluidPlayerOptions> = {
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
              label: 'Remove ads',
              href: '/premium?utm_source=internal&utm_medium=player-context-menu'
            },
            {
              label: 'Download',
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
      }
    }

    if (!isPremium.value) {
      timesVideoHasRendered.value++

      fluidPlayerOptions.vastOptions = {
        adText: 'Only one ad per hour. Never see ads again with Premium!',

        vastAdvanced: {
          /**
           * Handle empty VAST
           */
          vastVideoEndedCallback() {
            if (!mediaElement.value?.src.endsWith('/null')) {
              return
            }

            mediaElement.value.src = localSrc.value
            videoPlayer?.play()
          }
        },

        adList: []
      }

      // Only show pause roll ads on even videos
      if (timesVideoHasRendered.value % 2 === 0) {
        fluidPlayerOptions.vastOptions.adList.push(
          // In-Video Banner
          {
            roll: 'onPauseRoll',
            vastTag: 'https://s.magsrv.com/splash.php?idzone=5386214'
          }
        )
      }

      // Only show preroll ads after 5 videos
      if (timesVideoHasRendered.value > 5) {
        fluidPlayerOptions.vastOptions.adList.push(
          // In-Stream Video
          {
            roll: 'preRoll',
            vastTag: 'https://s.magsrv.com/splash.php?idzone=5386496'
          }
        )
      }
    }

    videoPlayer = fluidPlayer(mediaElement.value as HTMLVideoElement, fluidPlayerOptions)

    // TODO: Handle poster error
  }

  function destroyVideoPlayer() {
    if (!videoPlayer) {
      throw new Error('Player not found')
    }

    videoPlayer.destroy()
  }

  function reloadVideoPlayer(shouldPlay: boolean = false) {
    nextTick(() => {
      destroyVideoPlayer()

      nextTick(() => {
        createVideoPlayer()

        if (!shouldPlay) {
          return
        }

        nextTick(() => {
          videoPlayer?.play()
        })
      })
    })
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

    // Proxy GIFs
    if (isGif.value && isPremium.value) {
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

    if (!entry.isIntersecting) {
      videoPlayer?.pause()
    }
  }

  function onMediaLoad(event: Event) {
    mediaHasLoaded.value = true
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
      :class="mediaHasLoaded ? 'opacity-100' : 'opacity-0'"
      class="transition-opacity duration-700 ease-in-out"
    >
      <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
      <template v-if="!isPremium">
        <img
          ref="mediaElement"
          :alt="mediaAlt"
          :height="mediaSrcHeight"
          :src="localSrc"
          :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`"
          :width="mediaSrcWidth"
          class="h-auto w-full rounded-t-md"
          decoding="async"
          loading="lazy"
          @error="onMediaError"
          @load="onMediaLoad"
        />
      </template>

      <!-- Premium users get their media proxied and optimized -->
      <template v-else>
        <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
        <NuxtPicture
          ref="mediaElement"
          :alt="mediaAlt"
          :height="mediaSrcHeight"
          :imgAttrs="{
            class: 'h-auto w-full rounded-t-md',
            style: 'aspect-ratio: ' + mediaSrcWidth + '/' + mediaSrcHeight
          }"
          :src="localSrc"
          :width="mediaSrcWidth"
          decoding="async"
          loading="lazy"
          @error="onMediaError"
          @load="onMediaLoad"
        />
      </template>
    </div>

    <!-- Animated (GIF) -->
    <div
      v-else-if="isGif"
      class="relative"
    >
      <!-- Single image element for both poster and GIF -->
      <img
        ref="mediaElement"
        :alt="mediaAlt"
        :height="mediaSrcHeight"
        :src="isAnimatedMediaPlaying ? localSrc : localPosterSrc"
        :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`"
        :width="mediaSrcWidth"
        class="h-auto w-full rounded-t-md"
        decoding="async"
        loading="lazy"
        @error="onMediaError"
        @load="onMediaLoad"
      />

      <!-- Play button overlay -->
      <button
        v-if="!isAnimatedMediaPlaying"
        class="absolute inset-0 flex items-center justify-center rounded-t-md bg-black/20"
        type="button"
        @click="isAnimatedMediaPlaying = true"
      >
        <span class="rounded-full bg-black/65 p-2">
          <svg
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
        :height="mediaSrcHeight"
        :poster="localPosterSrc"
        :src="localSrc"
        :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`"
        :width="mediaSrcWidth"
        class="h-auto w-full rounded-t-md"
        controls
        loop
        playsinline
        preload="none"
        @error="onMediaError"
      />
    </div>
  </div>
</template>
