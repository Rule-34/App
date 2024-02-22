<script setup>
import {default as random_weighted_choice} from 'random-weighted-choice'

const premiumPromotions = [
    // Premium
    {
      media: '/img/promo/premium/Additional Boorus.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium?utm_source=internal&utm_medium=promo-additional-boorus'
    },
    {
      media: '/img/promo/premium/Discord Role.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium?utm_source=internal&utm_medium=promo-discord-role'
    },
    {
      media: '/img/promo/premium/No Ads.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium?utm_source=internal&utm_medium=promo-no-ads'
    },
    {
      media: '/img/promo/premium/History.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium?utm_source=internal&utm_medium=promo-history'
    },
    {
      media: '/img/promo/premium/One-Click Downloads.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium?utm_source=internal&utm_medium=promo-one-click-downloads'
    },
    {
      media: '/img/promo/premium/Save Posts.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium?utm_source=internal&utm_medium=promo-save-posts'
    },
    {
      media: '/img/promo/premium/Source Finder.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium?utm_source=internal&utm_medium=promo-source-finder'
    },
    {
      media: '/img/promo/premium/Support Us.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium?utm_source=internal&utm_medium=promo-support-us'
    },
    {
      media: '/img/promo/premium/Tag Collections.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: '/premium?utm_source=internal&utm_medium=promo-tag-collections'
    }
  ]

  const otherPromotions = [
    // HentaiPorn
    {
      media: '/img/promo/HentaiPorn.jpg',
      mediaWidth: 1280,
      mediaHeight: 1280,
      mediaType: 'image',
      link: 'https://hentaiporn.app/?utm_source=r34.app&utm_medium=promotion'
    }
  ]

  const referralPromotions = [
    // dreamgf.ai
    {
      media: '/img/promo/referrals/DreamGF-300x600-2.gif',
      mediaWidth: 300,
      mediaHeight: 600,
      mediaType: 'image',
      link: 'https://dreamgf.ai/?a=dEhouXU2PPmKlo'
    },
    {
      media: '/img/promo/referrals/DreamGF-1200x1200-1.jpg',
      mediaWidth: 1200,
      mediaHeight: 1200,
      mediaType: 'image',
      link: 'https://dreamgf.ai/?a=dEhouXU2PPmKlo'
    },
    // candy.ai
    {
      media: '/img/promo/referrals/AI-Girlfriend-300x600.jpg',
      mediaWidth: 300,
      mediaHeight: 600,
      mediaType: 'image',
      link: 'https://candy.ai?via=rule-3496'
    },
    {
      media: '/img/promo/referrals/AI-sexting-1200x1200.jpg',
      mediaWidth: 1200,
      mediaHeight: 1200,
      mediaType: 'image',
      link: 'https://candy.ai?via=rule-3496'
    }
  ]

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
