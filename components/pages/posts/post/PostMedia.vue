<script setup>
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

  const error = reactive({
    show: false,
    message: null
  })

  const isImage = computed(() => props.mediaType === 'image')
  const isVideo = computed(() => props.mediaType === 'video')

  // TODO: Media error retry
</script>

<template>
  <div>
    <!-- Error -->
    <template v-if="error.show">
      <NuxtLink
        class="link"
        href="https://www.rule34.app/frequently-asked-questions#74cfdf0316b04111b0c65b7f8502dfda"
        rel="noopener"
        target="_blank"
      >
        Learn more
      </NuxtLink>
    </template>

    <!-- Image -->
    <template v-else-if="isImage">
      <img
        ref="imageElement"
        :alt="mediaAlt"
        :height="mediaSrcHeight"
        :src="mediaSrc"
        :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`"
        :width="mediaSrcWidth"
        class="h-auto w-full opacity-0 transition-opacity duration-700 ease-in-out"
        decoding="async"
        loading="lazy"
        onload='this.classList.remove("opacity-0")'
        referrerpolicy="no-referrer"
      />
    </template>

    <!-- Video -->
    <template v-else-if="isVideo">
      <!-- TODO: Add load animation -->
      <video
        ref="videoElement"
        :height="mediaSrcHeight"
        :poster="mediaPosterSrc"
        :src="mediaSrc"
        :style="`aspect-ratio: ${mediaSrcWidth}/${mediaSrcHeight};`"
        :width="mediaSrcWidth"
        class="h-auto w-full"
        controls
        loop
        playsinline
        preload="none"
      />
    </template>
  </div>
</template>
