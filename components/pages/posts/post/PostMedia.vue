<script lang="ts" setup>
  import type { IPost } from '~/assets/js/post'
  import { vIntersectionObserver } from '@vueuse/components'
  import fluidPlayer from 'fluid-player'
  import 'fluid-player/src/css/fluidplayer.css'

  const { isPremium } = useUserData()

  export interface PostMediaProps {
    mediaSrc: string | null
    mediaSrcHeight: number | null
    mediaSrcWidth: number | null
    mediaPosterSrc: string | null
    mediaType: IPost['media_type']
    mediaAlt: string
  }

  const props = defineProps<PostMediaProps>()

  const mediaElement = ref<HTMLElement | null>(null)

  const localSrc = shallowRef(props.mediaSrc)
  const localPosterSrc = shallowRef(props.mediaPosterSrc)

  const mediaHasLoaded = ref(false)

  const error = ref<Error | null>(null)
  const hasError = computed(() => error.value !== null)

  const isImage = computed(() => props.mediaType === 'image')
  const isVideo = computed(() => props.mediaType === 'video')

  const triedToLoadWithProxy = shallowRef(false)

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

    if (isVideo.value) {
      // TODO: Test this
      // Remove sources
      finalMediaElement.innerHTML = ''

      finalMediaElement.load()

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

        allowTheatre: false,
        allowDownload: false
      }
    }

    if (!isPremium.value) {
      fluidPlayerOptions.vastOptions = {
        // TODO: Make it work
        // allowVPAID: true,

        adText: 'Get Premium and never see ads again!',

        vastAdvanced: {
          vastVideoSkippedCallback() {
            // TODO: Inform user about Premium
          }
        },

        adList: [
          /**
           * ExoClick
           */
          // In-Video Banner
          {
            roll: 'onPauseRoll',
            vastTag: 'https://s.magsrv.com/splash.php?idzone=5386214'
          }
          // In-Stream Video
          // {
          //   roll: 'preRoll',
          //   vastTag: 'https://s.magsrv.com/splash.php?idzone=5386496',
          //   adText: 'Get Premium and never see ads again!'
          // }

          /**
           * Clickadu
           */
          // In-Stream Video
          // {
          //   roll: 'preRoll',
          //   vastTag: 'https://engineexplicitfootrest.com/ceef/gdt3g0/tbt/2034767/tlk.xml'
          // }
        ]
      }
    }

    videoPlayer = fluidPlayer(mediaElement.value as HTMLVideoElement, fluidPlayerOptions)
  }

  function destroyVideoPlayer() {
    if (!videoPlayer) {
      throw new Error('Player not found')
    }

    videoPlayer.destroy()
  }

  function reloadVideoPlayer() {
    destroyVideoPlayer()
    createVideoPlayer()
  }

  function onMediaError(event: Event) {
    if (hasError.value) {
      return
    }

    if (!event.target?.src) {
      return
    }

    // Proxy videos, images are already proxied
    if (isVideo.value && !triedToLoadWithProxy.value && isPremium.value) {
      triedToLoadWithProxy.value = true

      const { proxiedUrl } = useProxyHelper(localSrc.value)
      const { proxiedUrl: proxiedPosterUrl } = useProxyHelper(props.mediaPosterSrc)

      localSrc.value = proxiedUrl.value
      localPosterSrc.value = proxiedPosterUrl.value

      if (!event.target.paused) {
        nextTick(() => {
          // TODO: Handle player errors?
          reloadVideoPlayer()

          videoPlayer?.play()
        })
      }
      return
    }

    error.value = new Error('Error loading media')
  }

  function manuallyReloadMedia() {
    // Reset state
    triedToLoadWithProxy.value = false
    error.value = null

    // Reload media
    localSrc.value = props.mediaSrc
    localPosterSrc.value = props.mediaPosterSrc

    nextTick(() => {
      reloadVideoPlayer()
    })
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
</script>

<template>
  <div :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`">
    <!-- Error -->
    <template v-if="hasError">
      <div class="flex h-full flex-col items-center space-y-4 py-4">
        <div class="flex flex-1 flex-col items-center justify-center gap-4">
          <span
            class="rounded-md bg-gradient-to-l from-base-950 via-base-900 to-base-900 px-4 py-1.5 text-center text-base-content-highlight"
          >
            {{ error?.message }}
          </span>

          <button
            class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util mx-auto inline-flex items-center justify-center rounded-md px-2 py-1 text-sm ring-1 ring-base-0/20"
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
          class="text-xs text-base-content"
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

        <div class="text-sm text-base-content">
          <span> Media not loading? </span>

          <NuxtLink
            class="hover:hover-text-util focus-visible:focus-outline-util underline"
            href="https://docs.r34.app/frequently-asked-questions#74cfdf0316b04111b0c65b7f8502dfda"
            target="_blank"
          >
            Learn more
          </NuxtLink>
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

    <!-- Video -->
    <div v-else-if="isVideo">
      <!-- TODO: Add load animation -->
      <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
      <video
        :key="localSrc"
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
