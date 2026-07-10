<script setup lang="ts">
  import {
    advertisementPromotions,
    otherPromotions,
    type Promotion,
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

  const promotionPools = {
    premiumPromotions,
    otherPromotions,
    referralPromotions,
    advertisementPromotions
  } satisfies Record<string, readonly Promotion[]>

  type PromotionPoolName = keyof typeof promotionPools

  function isPromotionPoolName(value: unknown): value is PromotionPoolName {
    return typeof value === 'string' && value in promotionPools
  }

  const selectedPromotionsName = randomWeightedChoice(weightedPromotions)
  const selectedPromotions = isPromotionPoolName(selectedPromotionsName)
    ? promotionPools[selectedPromotionsName]
    : premiumPromotions

  const promo = selectedPromotions[Math.floor(Math.random() * selectedPromotions.length)]

  if (!promo) {
    throw new Error('No promotion is available')
  }

  // Uses 'http://dummy' as a base URL to reliably parse relative paths with new URL().
  // The dummy origin is ignored and only used for parsing pathname, query, and hash,
  // which are then passed to localePath for internal route generation (see getInternalHref).
  const getInternalHref = (link: string): string => {
    const url: URL = new URL(link, 'http://dummy')
    const query: Record<string, string> = Object.fromEntries(url.searchParams.entries())
    return localePath({
      path: url.pathname,
      query: Object.keys(query).length > 0 ? query : undefined,
      hash: url.hash || undefined
    })
  }

  const promoHref = computed(() => {
    if (!promo.link) {
      return undefined
    }

    return isExternalHref(promo.link) ? promo.link : getInternalHref(promo.link)
  })
  const promoIsExternal = computed(() => (promo.link ? isExternalHref(promo.link) : false))
</script>

<template>
  <figure class="-mx-1 rounded-md border border-base-0/20">
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
      :href="promoHref"
      :target="promoIsExternal ? '_blank' : undefined"
      :rel="promoIsExternal ? 'nofollow noopener' : undefined"
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
        :href="
          localePath({ path: '/premium', query: { utm_source: 'internal', utm_medium: 'promo' }, hash: '#pricing' })
        "
        class="underline hover:hover-text-util focus-visible:focus-outline-util"
        >{{ $t('media.getPremium') }}<!----></NuxtLink
      ><!---->: {{ $t('media.promotedDescription') }}
    </figcaption>
  </figure>
</template>
