<script setup>
  import {
    advertisementPromotions,
    otherPromotions,
    premiumPromotions,
    referralPromotions
  } from '~/assets/js/promotions'
  import randomWeightedChoice from 'random-weighted-choice'
  import { isExternalHref } from '~/composables/locale'

  const localePath = useLocalePath()

  const weightedPromotions = [
    {
      id: 'premiumPromotions',
      weight: 3
    },
    {
      id: 'otherPromotions',
      weight: 1.5
    },
    // {
    //   weight: 1,
    //   id: 'referralPromotions'
    // },
    {
      weight: 1,
      id: 'advertisementPromotions'
    }
  ]

  const selectedPromotionsName = randomWeightedChoice(weightedPromotions)

  let selectedPromotions = []

  switch (selectedPromotionsName) {
    case 'premiumPromotions':
      selectedPromotions = premiumPromotions
      break
    case 'otherPromotions':
      selectedPromotions = otherPromotions
      break
    case 'referralPromotions':
      selectedPromotions = referralPromotions
      break
    case 'advertisementPromotions':
      selectedPromotions = advertisementPromotions
      break
    default:
      throw new Error('Invalid promotion type')
  }

  const promo = selectedPromotions[Math.floor(Math.random() * selectedPromotions.length)]

  const isExternal = isExternalHref(promo.link)

  const getInternalHref = (link) => {
    const url = new URL(link, 'http://dummy')
    const query = Object.fromEntries(url.searchParams.entries())
    return localePath({
      path: url.pathname,
      query: Object.keys(query).length > 0 ? query : undefined,
      hash: url.hash || undefined
    })
  }
</script>

<template>
  <figure class="border-base-0/20 -mx-1 rounded-md border">
    <!-- -->

    <template v-if="promo.mediaType === 'iframe'">
      <iframe
        :height="promo.mediaHeight"
        :src="promo.media"
        :width="promo.mediaWidth"
        class="mx-auto"
        credentialless="true"
        frameborder="0"
        loading="lazy"
        marginheight="0"
        marginwidth="0"
        sandbox="allow-scripts allow-same-origin"
        scrolling="no"
      />
    </template>

    <!-- Media -->
    <NuxtLink
      v-else
      :href="isExternal ? promo.link : getInternalHref(promo.link)"
      :target="isExternal ? '_blank' : undefined"
      :rel="isExternal ? 'nofollow noopener' : undefined"
    >
      <!-- TODO: Temporarily hardcode post index for promoted content -->
      <PostMedia
        :alt-media-src="null"
        :media-alt="$t('media.promotedContent')"
        :media-poster-src="null"
        :media-src="promo.media"
        :media-src-height="promo.mediaHeight"
        :media-src-width="promo.mediaWidth"
        :media-type="promo.mediaType"
        :post-index="99"
      />
    </NuxtLink>

    <!-- Body -->
    <figcaption class="px-1 py-3 text-center text-sm whitespace-normal">
      <NuxtLink
        :href="localePath({ path: '/premium', query: { utm_source: 'internal', utm_medium: 'promo' }, hash: '#pricing' })"
        class="hover:hover-text-util focus-visible:focus-outline-util underline"
        >{{ $t('media.getPremium')
        }}<!----></NuxtLink
      ><!---->: {{ $t('media.promotedDescription') }}
    </figcaption>
  </figure>
</template>
