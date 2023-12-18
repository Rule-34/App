<script setup>
  const promos = [
    // Premium
    {
      media: '/img/promo/premium/Additional Boorus.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium'
    },
    {
      media: '/img/promo/premium/Discord Role.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium'
    },
    {
      media: '/img/promo/premium/Hide Promoted Content.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium'
    },
    {
      media: '/img/promo/premium/One-Click Downloads.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium'
    },
    {
      media: '/img/promo/premium/Save Posts.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium'
    },
    {
      media: '/img/promo/premium/Source Locator.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium'
    },
    {
      media: '/img/promo/premium/Support Us.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium'
    },
    {
      media: '/img/promo/premium/Tag Collections.jpg',
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
      link: 'https://hentaiporn.app/?utm_source=r34.app&utm_medium=promotion'
    },
    // Promptchan
    {
      media: '/img/promo/promptchan_ai.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: 'https://promptchan.ai/m/wVKbbEDyPff89wF19ikY65SOZDy2'
    },
    // DeepSwap
    {
      media: '/img/promo/deepswap_ai.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: 'https://www.deepswap.ai?utm_source=af-rule34&cp_id=ElLfUSVX'
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
      class="focus-visible:focus-outline-util focus-visible:ring-inset"
      target="_blank"
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
