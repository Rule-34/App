<script lang="ts" setup>
  import { vIntersectionObserver } from '@vueuse/components'
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

  const mediaHasLoaded = ref(false)

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

    // Skip if no src
    // @see onIntersectionObserver method
    if (!event.target?.src) {
      return
    }

    if (!triedToLoadWithProxy.value && isPremium.value) {
      triedToLoadWithProxy.value = true

      const { proxiedUrl } = useProxyHelper(localSrc.value)

      localSrc.value = proxiedUrl.value
      // Fix: Inmediately set src to proxied url, since onIntersectionObserver method will not be called until out of viewport
      event.target.src = proxiedUrl.value

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

  function onIntersectionObserver(entries: IntersectionObserverEntry[]) {
    const entry = entries[0]

    // Smallest video & image possible - https://stackoverflow.com/a/36610159/11398632
    const smallestImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
    const smallestVideo =
      'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAtJtZGF0AAACrQYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwMyA5NDFjYWU2IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMiAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAAVZYiEABX//vfJ78Cm6/X2tb9gAQD5AAADBm1vb3YAAABsbXZoZAAAAADgYBEw4GARMAAAA+gAAAPoAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIwdHJhawAAAFx0a2hkAAAAA+BgETDgYBEwAAAAAQAAAAAAAAPoAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAUAAAAFAAAAAAAJGVkdHMAAAAcZWxzdAAAAAAAAAABAAAD6AAAAAAAAQAAAAABqG1kaWEAAAAgbWRoZAAAAADgYBEw4GARMAAAQAAAAEAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVNtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAETc3RibAAAAK9zdHNkAAAAAAAAAAEAAACfYXZjMQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAUABQASAAAAEgAAAAAAAAAARVMYXZjNTkuNTYuMTAwIGxpYngyNjQAAAAAAAAAAAAAABj//wAAADVhdmNDAWQAM//hABhnZAAzrNlJeeeEAAADAAQAAAMACDxgxlgBAAZo6+PLIsD9+PgAAAAAFGJ0cnQAAAAAAAAWUAAAFlAAAAAYc3R0cwAAAAAAAAABAAAAAQAAQAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAACygAAAAEAAAAUc3RjbwAAAAAAAAABAAAAMAAAAGJ1ZHRhAAAAWm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALWlsc3QAAAAlqXRvbwAAAB1kYXRhAAAAAQAAAABMYXZmNTkuMzUuMTAw'

    const smallestMedia = isImage.value
      ? //
        smallestImage
      : smallestVideo

    const mediaElement = entry.target as HTMLImageElement | HTMLVideoElement

    const newSrc = entry.isIntersecting
      ? //
        (mediaElement.getAttribute('data-src') as string)
      : smallestMedia

    mediaElement.src = newSrc
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
            v-if="error?.message !== 'Unknown media type'"
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
          v-if="!isPremium && error?.message !== 'Unknown media type'"
          class="text-xs text-base-content"
        >
          <NuxtLink
            class="hover:hover-text-util focus-visible:focus-outline-util underline"
            href="/premium"
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
            href="https://www.rule34.app/frequently-asked-questions#74cfdf0316b04111b0c65b7f8502dfda"
            target="_blank"
          >
            Learn more
          </NuxtLink>
        </div>
      </div>
    </template>

    <!-- Image -->
    <template v-else-if="isImage">
      <!-- TODO: Fix very large images not being on screen so not loaded -->
      <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
      <img
        v-intersection-observer="[onIntersectionObserver, { rootMargin: '1200px' }]"
        :alt="mediaAlt"
        :class="[mediaHasLoaded ? 'opacity-100' : 'opacity-0']"
        :data-src="localSrc"
        :height="mediaSrcHeight"
        :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`"
        :width="mediaSrcWidth"
        class="h-auto w-full rounded-t-md transition-opacity duration-700 ease-in-out"
        decoding="async"
        loading="lazy"
        @error="onMediaError"
        @load="onMediaLoad"
      />
    </template>

    <!-- Video -->
    <template v-else-if="isVideo">
      <!-- TODO: Add load animation -->
      <!-- Fix(rounded borders): add the same rounded borders that the parent has -->
      <video
        v-intersection-observer="[onIntersectionObserver, { rootMargin: '1200px' }]"
        :data-src="localSrc"
        :height="mediaSrcHeight"
        :poster="mediaPosterSrc"
        :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`"
        :width="mediaSrcWidth"
        class="h-auto w-full rounded-t-md"
        controls
        loop
        playsinline
        preload="none"
        @error="onMediaError"
      />
    </template>
  </div>
</template>
