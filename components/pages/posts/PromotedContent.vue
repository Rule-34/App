<script setup>
  import {
    advertisementPromotions,
    otherPromotions,
    premiumPromotions,
    referralPromotions
  } from '~/assets/js/promotions'
  import { default as random_weighted_choice } from 'random-weighted-choice'
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

  const selectedPromotionsName = random_weighted_choice(weightedPromotions)

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
      :href="isExternalHref(promo.link) ? promo.link : localePath(promo.link)"
:target="isExternalHref(promo.link) ? '_blank' : null"

      :rel="isExternalHref(promo.link) ? 'nofollow noopener' : undefined"
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
        :href="localePath('/premium?utm_source=internal&utm_medium=promo#pricing')"
        class="hover:hover-text-util focus-visible:focus-outline-util underline"
        >{{ $t('media.getPremium')
        }}<!----></NuxtLink
      ><!---->: {{ $t('media.promotedDescription') }}
    </figcaption>
  </figure>
</template>
