<script lang="ts" setup>
  import { ProxyHelper } from 'assets/js/ProxyHelper'

  const props = defineProps({
    mediaSrc: {
      type: String,
      required: true
    },
    mediaSrcHeight: {
      type: Number,
      required: true
    },
    mediaSrcWidth: {
      type: Number,
      required: true
    },
    mediaPosterSrc: {
      type: String,
      required: false
    },
    mediaType: {
      type: String,
      required: true
    },
    mediaAlt: {
      type: String,
      required: true
    }
  })

  const localSrc = ref(props.mediaSrc)

  const hasError = ref(false)

  const isImage = computed(() => props.mediaType === 'image')
  const isVideo = computed(() => props.mediaType === 'video')

  const triedToLoadWithProxy = ref(false)

  function onMediaError(event: Event) {
    console.log('onMediaError', event)
    if (hasError.value) {
      return
    }

    if (!triedToLoadWithProxy.value) {
      triedToLoadWithProxy.value = true

      const proxySrc = ProxyHelper.proxyUrl(localSrc.value)

      localSrc.value = proxySrc

      return
    }

    hasError.value = true
  }

  function manuallyReloadMedia() {
    // Reset state
    triedToLoadWithProxy.value = false
    hasError.value = false

    // Reload media
    localSrc.value = ''
    localSrc.value = props.mediaSrc
  }
</script>

<template>
  <div :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`">
    <!-- Error -->
    <template v-if="hasError">
      <div class="flex h-full flex-col items-center py-4">
        <div class="flex flex-1 flex-col items-center justify-center gap-4">
          <span
            class="rounded-md bg-gradient-to-l from-base-950 via-base-900 to-base-900 px-4 py-1.5 text-center text-base-content-highlight"
          >
            Error loading media
          </span>

          <button
            class="focus-visible:focus-util hover:hover-bg-util hover:hover-text-util mx-auto inline-flex items-center justify-center rounded-md px-2 py-1 text-sm ring-1 ring-base-0/20"
            type="button"
            @click="manuallyReloadMedia"
          >
            Try again?
          </button>
        </div>

        <NuxtLink
          class="hover:hover-text-util focus-visible:focus-util justify-self-end text-sm text-base-content underline"
          href="https://www.rule34.app/frequently-asked-questions#74cfdf0316b04111b0c65b7f8502dfda"
          target="_blank"
        >
          Media not loading? Learn more
        </NuxtLink>
      </div>
    </template>

    <!-- Image -->
    <template v-else-if="isImage">
      <img
        :alt="mediaAlt"
        :height="mediaSrcHeight"
        :src="localSrc"
        :width="mediaSrcWidth"
        class="h-auto w-full opacity-0 transition-opacity duration-700 ease-in-out"
        decoding="async"
        loading="lazy"
        onload='this.classList.remove("opacity-0")'
        referrerpolicy="no-referrer"
        @error="onMediaError"
      />
    </template>

    <!-- Video -->
    <template v-else-if="isVideo">
      <!-- TODO: Add load animation -->
      <video
        :height="mediaSrcHeight"
        :poster="mediaPosterSrc"
        :src="localSrc"
        :width="mediaSrcWidth"
        class="h-auto w-full"
        controls
        loop
        playsinline
        preload="none"
        @error="onMediaError"
      />
    </template>
  </div>
</template>
