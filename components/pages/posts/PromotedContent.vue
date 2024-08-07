<script setup>
  import { otherPromotions, premiumPromotions, referralPromotions } from '~/assets/js/promotions'
  import { default as random_weighted_choice } from 'random-weighted-choice'

  const weightedPromotions = [
    {
      id: 'premiumPromotions',
      weight: 1.2
    },
    {
      id: 'otherPromotions',
      weight: 1
    },
    {
      weight: 1,
      id: 'referralPromotions'
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
    default:
      throw new Error('Invalid promotion type')
  }

  const promo = selectedPromotions[Math.floor(Math.random() * selectedPromotions.length)]
</script>

<template>
  <figure class="-mx-1 rounded-md border border-base-0/20">
    <!-- -->

    <!-- Media -->
    <NuxtLink
      :href="promo.link"
      :target="promo.link.startsWith('http') ? '_blank' : null"
      class="focus-visible:focus-outline-util focus-visible:ring-inset"
      rel="nofollow noopener"
    >
      <PostMedia
        :alt-media-src="null"
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
        href="/premium?utm_source=internal&utm_medium=promo"
        >Get Premium<!----></NuxtLink
      ><!---->: No ads + exclusive features
    </figcaption>
  </figure>
</template>
