<script lang="ts" setup>
  import { XMarkIcon } from '@heroicons/vue/20/solid'
  import { useNow } from '@vueuse/core'
  import { ghostOfferUrl, trackPromotionCheckout } from '~/assets/js/promotion-checkout'

  const { activePromotion, shouldShow, dismiss } = useActivePromotion()
  const localePath = useLocalePath()
  const { t } = useI18n()

  // Use VueUse's reactive current time (updates every second)
  const now = useNow({ interval: 1000 })

  /**
   * Countdown timer showing remaining time (using VueUse's reactive now)
   */
  const countdownLabels = computed(() => ({
    days: t('time.days'),
    hours: t('time.hours'),
    minutes: t('time.minutes'),
    seconds: t('time.seconds')
  }))

  const countdownText = computed(() => {
    const end = activePromotion.value?.range.end
    if (!end) return null

    const diff = end.getTime() - now.value.getTime()

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    const d = countdownLabels.value.days
    const h = countdownLabels.value.hours
    const m = countdownLabels.value.minutes
    const s = countdownLabels.value.seconds

    if (days > 0) {
      return `${days}${d} ${hours}${h} ${minutes}${m} ${seconds}${s}`
    } else if (hours > 0) {
      return `${hours}${h} ${minutes}${m} ${seconds}${s}`
    } else if (minutes > 0) {
      return `${minutes}${m} ${seconds}${s}`
    } else {
      return `${seconds}${s}`
    }
  })

  /**
   * Offer links apply the discount in Ghost checkout; no code to copy.
   */
  const offerLinks = computed(() => {
    const promotion = activePromotion.value
    if (!promotion) return []

    return [
      {
        cadence: 'monthly' as const,
        cadenceLabel: t('common.monthly'),
        label: t('promotions.monthlyOffer', { percent: promotion.discountPercent }),
        url: ghostOfferUrl(promotion.offers.monthly)
      },
      {
        cadence: 'yearly' as const,
        cadenceLabel: t('common.yearly'),
        label: t('promotions.yearlyOffer', { percent: promotion.discountPercent }),
        url: ghostOfferUrl(promotion.offers.yearly)
      }
    ]
  })

  function onOfferClick(cadence: 'monthly' | 'yearly') {
    if (activePromotion.value) trackPromotionCheckout(activePromotion.value.id, cadence)
  }
</script>

<template>
  <div
    v-if="shouldShow && activePromotion"
    class="relative mx-auto w-full max-w-md pt-4"
  >
    <!-- Discount badge (floating above) -->
    <div
      v-if="activePromotion.discountPercent"
      class="absolute -top-1 left-1/2 z-10 -translate-x-1/2"
    >
      <div
        class="inline-flex items-center gap-1.5 rounded-full bg-primary-500/20 px-4 py-1.5 ring-2 ring-primary-500/30 backdrop-blur-sm"
      >
        <span
          v-if="activePromotion.emoji"
          class="text-base"
          >{{ activePromotion.emoji }}</span
        >

        <span class="text-sm font-bold text-primary-400">
          {{ t('promotions.percentOff', { percent: activePromotion.discountPercent }) }}
        </span>
      </div>
    </div>

    <div class="relative rounded-2xl bg-base-1000/70 p-5 ring-2 ring-base-0/10 backdrop-blur-sm sm:p-6">
      <!-- Close button -->
      <button
        :aria-label="t('common.closePromotionalBanner')"
        class="absolute -top-4 -right-4 rounded-full bg-base-1000 p-1.5 text-2xl font-bold ring-2 ring-base-0/20 ring-inset hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="dismiss"
      >
        <XMarkIcon
          aria-hidden="true"
          class="h-6 w-6"
        />
      </button>

      <!-- Title -->
      <div class="mt-4 mb-3 text-center sm:mt-5">
        <h2 class="text-lg leading-tight font-bold text-base-content-highlight sm:text-xl">
          {{ t(activePromotion.title) }}
        </h2>
      </div>

      <!-- Description -->
      <p
        v-if="activePromotion.description"
        class="mb-5 text-center text-sm text-base-content"
      >
        {{ t(activePromotion.description) }}
      </p>

      <!-- Countdown timer -->
      <p
        v-if="countdownText"
        class="mb-5 text-center text-xs text-base-content"
      >
        {{ t('common.endsIn') }}
        <span
          class="inline-block font-mono text-sm font-semibold tracking-tight text-base-content-highlight tabular-nums"
          >{{ countdownText }}</span
        >
      </p>

      <!-- Offer links: the discount is applied at checkout -->
      <div class="grid gap-2.5 sm:grid-cols-2">
        <a
          v-for="offer in offerLinks"
          :key="offer.cadence"
          :href="offer.url"
          class="group flex flex-col rounded-lg p-3 ring-1 ring-base-0/20 transition-colors hover:hover-bg-util focus-visible:focus-outline-util"
          rel="nofollow noopener noreferrer"
          target="_blank"
          @click="onOfferClick(offer.cadence)"
        >
          <span class="text-xs text-base-content">{{ offer.cadenceLabel }}</span>
          <span class="text-sm font-semibold text-primary-400 group-hover:text-primary-300">
            {{ offer.label }}
          </span>
        </a>
      </div>

      <!-- CTA button -->
      <NuxtLink
        v-if="activePromotion.cta"
        :to="localePath(activePromotion.cta.link)"
        class="bg-util mt-5 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-base-content-highlight ring-2 ring-base-0/20 transition-all hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        rel="nofollow noopener noreferrer"
      >
        {{ t(activePromotion.cta.text) }}
      </NuxtLink>
    </div>
  </div>
</template>
