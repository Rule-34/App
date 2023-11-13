<script lang='ts' setup>
import { vIntersectionObserver } from '@vueuse/components'
import { ProxyHelper } from '~/assets/js/ProxyHelper'
import type { IPost } from 'assets/js/post'

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

const localSrc = shallowRef(props.mediaSrc)

const error = ref<Error | null>(null)
const hasError = computed(() => error.value !== null)

const isImage = computed(() => props.mediaType === 'image')
const isVideo = computed(() => props.mediaType === 'video')

const triedToLoadWithProxy = shallowRef(false)

if (props.mediaType === 'unknown') {
  error.value = new Error('Unknown media type')
}

function onMediaError(event: Event) {
  if (hasError.value) {
    return
  }

  // TODO: Retry with extra /
  // TODO: Retry with other file extensions, e.g. .jpeg to .gif (as seen in realbooru)
  // TODO: https://github.com/mikf/gallery-dl/issues/2530
  // TODO: https://github.com/Bionus/imgbrd-grabber/issues/2692#issuecomment-1141236485
  // TODO: https://realbooru.com/index.php?page=forum&s=view&id=6522&pid=105

  if (!triedToLoadWithProxy.value && isPremium.value) {
    triedToLoadWithProxy.value = true

    const proxySrc = ProxyHelper.proxyUrl(localSrc.value)

    localSrc.value = proxySrc

    return
  }

  error.value = new Error('Error loading media')
}

function manuallyReloadMedia() {
  // Reset state
  triedToLoadWithProxy.value = false
  error.value = null

  // Reload media
  localSrc.value = ''
  localSrc.value = props.mediaSrc
}

// TODO: Check if this is needed when implementing virtual scrolling
// TODO: Implement poor-man's virtual scrolling - https://github.com/Rule-34/App/blob/bf1ee57d78e32fed5825c6c465bcdfa8785108ee/components/pages/posts/post/PostMedia.vue#L219
function onIntersectionObserver(entries: IntersectionObserverEntry[]) {
  const entry = entries[0]

  // Stop video if it's not in view
  if (entry.isIntersecting) {
    return
  }

  const video = entry.target as HTMLVideoElement

  if (!video || video.paused) {
    return
  }

  video.pause()
}
</script>

<template>
  <div :style='`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`'>
    <!-- Error -->
    <template v-if='hasError'>
      <div class='flex h-full flex-col items-center py-4 space-y-4'>
        <div class='flex flex-1 flex-col items-center justify-center gap-4'>
          <span
            class='rounded-md bg-gradient-to-l from-base-950 via-base-900 to-base-900 px-4 py-1.5 text-center text-base-content-highlight'
          >
            {{ error?.message }}
          </span>

          <button
            v-if='error?.message !== "Unknown media type"'
            class='focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util mx-auto inline-flex items-center justify-center rounded-md px-2 py-1 text-sm ring-1 ring-base-0/20'
            type='button'
            @click='manuallyReloadMedia'
          >
            Try again?
          </button>
        </div>

        <!-- Premium promotion -->
        <!-- TODO: Improve style -->
        <div
          v-if='!isPremium && error?.message !== "Unknown media type"'
          class='text-xs text-base-content'
        >
          <NuxtLink
            class='hover:hover-text-util focus-visible:focus-outline-util  underline'
            href='/premium'
          >
            <!-- @formatter:off -->
            Get Premium</NuxtLink>

          <span> to bypass website blocks</span>
        </div>

        <div
          class='text-sm text-base-content'
        >

          <span>
            Media not loading?
          </span>

          <NuxtLink
            class='hover:hover-text-util focus-visible:focus-outline-util underline'
            href='https://www.rule34.app/frequently-asked-questions#74cfdf0316b04111b0c65b7f8502dfda'
            target='_blank'
          >
            Learn more
          </NuxtLink>
        </div>
      </div>
    </template>

    <!-- Image -->
    <template v-else-if='isImage'>
      <img
        :alt='mediaAlt'
        :height='mediaSrcHeight'
        :src='localSrc'
        :width='mediaSrcWidth'
        class='h-auto w-full opacity-0 transition-opacity duration-700 ease-in-out'
        decoding='async'
        loading='lazy'
        onload='this.classList.remove("opacity-0")'
        referrerpolicy='no-referrer'
        @error='onMediaError'
      />
    </template>

    <!-- Video -->
    <template v-else-if='isVideo'>
      <!-- TODO: Add load animation -->
      <video
        v-intersection-observer='onIntersectionObserver'
        :height='mediaSrcHeight'
        :poster='mediaPosterSrc'
        :src='localSrc'
        :width='mediaSrcWidth'
        class='h-auto w-full'
        controls
        loop
        playsinline
        preload='none'
        @error='onMediaError'
      />
    </template>
  </div>
</template>
