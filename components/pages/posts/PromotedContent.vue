<script setup>
const promos = [
  // Premium
  {
    media: '/img/promo/premium/Additional Boorus.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=web&utm_medium=promo-additional-boorus'
  },
  {
    media: '/img/promo/premium/Discord Role.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=web&utm_medium=promo-discord-role'
  },
  {
    media: '/img/promo/premium/No Ads.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=web&utm_medium=promo-no-ads'
  },
  {
    media: '/img/promo/premium/History.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=web&utm_medium=promo-history'
  },
  {
    media: '/img/promo/premium/One-Click Downloads.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=web&utm_medium=promo-one-click-downloads'
  },
  {
    media: '/img/promo/premium/Save Posts.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=web&utm_medium=promo-save-posts'
  },
  {
    media: '/img/promo/premium/Source Finder.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=web&utm_medium=promo-source-finder'
  },
  {
    media: '/img/promo/premium/Support Us.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=web&utm_medium=promo-support-us'
  },
  {
    media: '/img/promo/premium/Tag Collections.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: '/premium?utm_source=web&utm_medium=promo-tag-collections'
  },
  // HentaiPorn
  {
    media: '/img/promo/HentaiPorn.jpg',
    mediaWidth: 1280,
    mediaHeight: 1280,
    mediaType: 'image',
    link: 'https://hentaiporn.app/?utm_source=r34.app&utm_medium=promotion'
  }
]

const promo = promos[Math.floor(Math.random() * promos.length)]
</script>

<template>
  <figure class="-mx-1 rounded-md border border-base-0/20">
    <!-- -->

    <!-- Media -->
    <NuxtLink
      :href="promo.link"
      :target="promo.link.startsWith('http') ? '_blank' : null"
      class="focus-visible:focus-outline-util focus-visible:ring-inset"
    >
      <PostMedia
        :media-alt="'Promoted content'"
        :media-poster-src="null"
        :media-src="promo.media"
        :media-src-height="promo.mediaHeight"
        :media-src-width="promo.mediaWidth"
        :media-type="promo.mediaType"
      />
    </NuxtLink>

    <!-- Body -->
    <figcaption class="whitespace-normal px-1 py-3 text-center text-sm">
      <NuxtLink
        class="hover:hover-text-util focus-visible:focus-outline-util underline"
        href="/premium"
      >Get Premium<!----></NuxtLink
      ><!---->: No ads + exclusive features
    </figcaption>
  </figure>
</template>
