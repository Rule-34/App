<script setup>
  const promos = [
    // Premium
    {
      media: '/img/promo/R34_App_Premium.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium'
    },
    // HentaiPorn
    {
      media: '/img/promo/HentaiPorn.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: 'https://hentaiporn.app/?utm_source=R34App&utm_medium=Promotion'
    }
  ]

  const promo = promos[Math.floor(Math.random() * promos.length)]
</script>

<template>
  <figure class="promo -mx-1 overflow-hidden rounded-md ring-1 ring-base-0/20">
    <!-- -->

    <!-- Media -->
    <NuxtLink
      :href="promo.link"
      class="focus-visible:focus-util focus-visible:ring-inset"
      target="_blank"
    >
      <PostMedia
        :media-src="promo.media"
        :media-src-height="promo.mediaHeight"
        :media-src-width="promo.mediaWidth"
        :media-type="promo.mediaType"
        media-alt="Promoted content"
      />
    </NuxtLink>

    <!-- Body -->
    <figcaption class="whitespace-normal px-1 py-3 text-center text-sm">
      <NuxtLink
        class="hover:hover-text-util focus-visible:focus-util underline"
        href="/premium"
        >Get Premium<!----></NuxtLink
      ><!---->: No promos + exclusive features!
    </figcaption>
  </figure>
</template>
