<script setup>
  const ADVERTISEMENTS = [
    // Premium
    {
      media: '/img/advertisement/R34_App_Premium.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium'
    },
    // HentaiPorn
    {
      media: '/img/advertisement/HentaiPorn.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: 'https://hentaiporn.app/?utm_source=R34App&utm_medium=Advertisement'
    }
  ]

  const advertisement = ADVERTISEMENTS[Math.floor(Math.random() * ADVERTISEMENTS.length)]
</script>

<template>
  <figure class="advertisement ad ads -mx-1 overflow-hidden rounded-md ring-1 ring-base-0/20">
    <!-- -->

    <!-- Media -->
    <NuxtLink
      :href="advertisement.link"
      class="focus-visible:focus-util focus-visible:ring-inset"
      target="_blank"
    >
      <PostMedia
        :media-src="advertisement.media"
        :media-src-height="advertisement.mediaHeight"
        :media-src-width="advertisement.mediaWidth"
        :media-type="advertisement.mediaType"
        media-alt="Advertisement"
      />
    </NuxtLink>

    <!-- Body -->
    <figcaption class="whitespace-normal px-1 py-1.5 text-center text-sm">
      Get
      <NuxtLink
        class="hover:hover-text-util focus-visible:focus-util underline"
        href="/premium"
        >Premium<!----></NuxtLink
      ><!---->: No ads + exclusive features!
    </figcaption>
  </figure>
</template>
