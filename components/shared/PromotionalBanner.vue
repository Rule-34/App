<script lang="ts" setup>
import { CheckIcon, DocumentDuplicateIcon, XMarkIcon } from '@heroicons/vue/20/solid'
import { useClipboard, useNow } from '@vueuse/core'

const { activePromotion, shouldShow, dismiss } = useActivePromotion()

  // Use VueUse's reactive current time (updates every second)
  const now = useNow({ interval: 1000 })

  /**
   * Convert MonthDay to full Date object for the current year
   */
  const endDate = computed(() => {
    if (!activePromotion.value) return null

    const year = now.value.getFullYear()

    // Create date at end of day (23:59:59)
    return new Date(year, activePromotion.value.endDate.month - 1, activePromotion.value.endDate.day, 23, 59, 59)
  })

  /**
   * Countdown timer showing remaining time (using VueUse's reactive now)
   */
  const countdownText = computed(() => {
    if (!endDate.value) return null

    const diff = endDate.value.getTime() - now.value.getTime()

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  })

  /**
   * Clipboard utilities using VueUse (auto-handles permissions and errors)
   */
  const { copy: copyMonthly, copied: copiedMonthly } = useClipboard()
  const { copy: copyYearly, copied: copiedYearly } = useClipboard()
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
        class="bg-primary-500/20 ring-primary-500/30 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 ring-2 backdrop-blur-sm"
      >
        <span
          v-if="activePromotion.emoji"
          class="text-base"
          >{{ activePromotion.emoji }}</span
        >
        <span class="text-primary-400 text-sm font-bold"> {{ activePromotion.discountPercent }}% OFF </span>
      </div>
    </div>

    <div class="bg-base-1000/70 ring-base-0/10 relative rounded-2xl p-5 ring-2 backdrop-blur-sm sm:p-6">
      <!-- Close button -->
      <button
        aria-label="Close promotional banner"
        class="hover:hover-bg-util bg-base-1000 hover:hover-text-util focus-visible:focus-outline-util ring-base-0/20 absolute -top-4 -right-4 rounded-full p-1.5 text-2xl font-bold ring-2 ring-inset"
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
        <h2 class="text-base-content-highlight text-lg leading-tight font-bold sm:text-xl">
          {{ activePromotion.title }}
        </h2>
      </div>

      <!-- Description -->
      <p
        v-if="activePromotion.description"
        class="text-base-content mb-5 text-center text-sm"
      >
        {{ activePromotion.description }}
      </p>

      <!-- Countdown timer -->
      <p
        v-if="countdownText"
        class="text-base-content mb-5 text-center text-xs"
      >
        Ends in
        <span
          class="text-base-content-highlight inline-block font-mono text-sm font-semibold tracking-tight tabular-nums"
          >{{ countdownText }}</span
        >
      </p>

      <!-- Discount codes -->
      <div class="space-y-2.5">
        <!-- Monthly code -->
        <button
          class="hover:hover-bg-util focus-visible:focus-outline-util ring-base-0/20 group flex w-full items-center justify-between rounded-lg p-3 ring-1 transition-colors"
          type="button"
          @click="copyMonthly(activePromotion.monthlyCode)"
        >
          <div class="min-w-0 flex-1">
            <span class="text-base-content block text-xs">Monthly</span>
            <span class="text-base-content-highlight block truncate font-mono text-sm font-semibold">
              {{ activePromotion.monthlyCode }}
            </span>
          </div>
          <CheckIcon
            v-if="copiedMonthly"
            aria-hidden="true"
            class="text-primary-400 ml-2 h-4 w-4 shrink-0"
          />
          <DocumentDuplicateIcon
            v-else
            aria-hidden="true"
            class="text-base-content group-hover:text-base-content-hover ml-2 h-4 w-4 shrink-0 transition-colors"
          />
        </button>

        <!-- Yearly code -->
        <button
          class="hover:hover-bg-util focus-visible:focus-outline-util ring-base-0/20 group flex w-full items-center justify-between rounded-lg p-3 ring-1 transition-colors"
          type="button"
          @click="copyYearly(activePromotion.yearlyCode)"
        >
          <div class="min-w-0 flex-1">
            <span class="text-base-content block text-xs">Yearly</span>
            <span class="text-base-content-highlight block truncate font-mono text-sm font-semibold">
              {{ activePromotion.yearlyCode }}
            </span>
          </div>
          <CheckIcon
            v-if="copiedYearly"
            aria-hidden="true"
            class="text-primary-400 ml-2 h-4 w-4 shrink-0"
          />
          <DocumentDuplicateIcon
            v-else
            aria-hidden="true"
            class="text-base-content group-hover:text-base-content-hover ml-2 h-4 w-4 shrink-0 transition-colors"
          />
        </button>
      </div>

      <!-- CTA button -->
      <NuxtLink
        v-if="activePromotion.cta"
        :to="activePromotion.cta.link"
        class="hover:hover-text-util hover:hover-bg-util focus-visible:focus-outline-util bg-util text-base-content-highlight ring-base-0/20 mt-5 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold ring-2 transition-all"
        rel="nofollow noopener noreferrer"
      >
        {{ activePromotion.cta.text }}
      </NuxtLink>
    </div>
  </div>
</template>
