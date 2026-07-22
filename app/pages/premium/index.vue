<script lang="ts" setup>
  import { CheckIcon, ChevronUpIcon, StarIcon } from '@heroicons/vue/20/solid'
  import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/solid'
  import { completeBooruList, defaultBooruList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
  import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    TransitionChild,
    TransitionRoot
  } from '@headlessui/vue'
  import { project } from '~~/config/project'

  const { shouldShow } = useActivePromotion()
  const { t } = useI18n()
  const localePath = useLocalePath()
  const customerCount = 2363

  const mainFeatures = computed(() => [
    t('pages.premium.landingPage.featureNoAds'),
    t('pages.premium.landingPage.featureFasterImages'),
    t('pages.premium.landingPage.featureAdditionalWebsites', {
      count: completeBooruList.length - defaultBooruList.length
    }),
    t('pages.premium.landingPage.featureSavePosts'),
    t('pages.premium.landingPage.featureDownload'),
    t('pages.premium.landingPage.featureFindSource'),
    t('pages.premium.landingPage.featureHistory'),
    t('pages.premium.landingPage.featureTagCollections'),
    t('pages.premium.landingPage.featureBlockTags'),
    t('pages.premium.landingPage.featureProxy'),
    t('pages.premium.landingPage.featureDiscordRole'),
    t('pages.premium.landingPage.featureSupportDev')
  ])

  const testimonials = computed(() => [
    { text: t('pages.premium.landingPage.testimonial1Text'), from: t('pages.premium.landingPage.testimonial1From') },
    { text: t('pages.premium.landingPage.testimonial2Text'), from: t('pages.premium.landingPage.testimonial2From') },
    { text: t('pages.premium.landingPage.testimonial3Text'), from: t('pages.premium.landingPage.testimonial3From') },
    { text: t('pages.premium.landingPage.testimonial4Text'), from: t('pages.premium.landingPage.testimonial4From') }
  ])

  const paymentIntervals = computed(() => [
    {
      key: 'monthly',
      name: t('pages.premium.landingPage.planMonthlyName'),
      description: t('pages.premium.landingPage.planMonthlyDescription'),
      price: 7,
      checkoutPrice: 7,
      originalPrice: 12.99,
      interval: 'month',
      links: [
        {
          name: 'Credit Card',
          url: 'https://www.refinedsoft.com/shop-premium-features-discord-role/#/portal/signup/6881f5fb9c83c40001487e13/monthly',
          category: 'creditCard',
          cta: t('pages.premium.landingPage.subscribeWithCreditCard')
        },
        {
          name: 'SellApp',
          url: 'https://refinedsoft.sell.app/product/premium-monthly-crypto?payment_method=XMR',
          faviconDomain: 'https://sell.app',
          category: 'crypto',
          cta: t('pages.premium.landingPage.subscribeWithCrypto')
        }
      ]
    },
    {
      key: '30days',
      name: t('pages.premium.landingPage.plan30DaysName'),
      description: t('pages.premium.landingPage.oneTimePayment'),
      price: 12.99,
      checkoutPrice: 12.99,
      originalPrice: undefined,
      interval: 'once',
      links: [
        {
          name: 'SellApp',
          url: 'https://refinedsoft.sell.app/product/premium-30-days-access',
          faviconDomain: 'https://sell.app',
          category: 'creditCard',
          cta: t('pages.premium.landingPage.payWithCreditCard')
        },
        {
          name: 'SellApp',
          url: 'https://refinedsoft.sell.app/product/premium-30-days-access?payment_method=XMR',
          faviconDomain: 'https://sell.app',
          category: 'crypto',
          cta: t('pages.premium.landingPage.payWithCrypto')
        }
      ]
    },
    {
      key: 'yearly',
      name: t('pages.premium.landingPage.planYearlyName'),
      description: t('pages.premium.landingPage.planYearlyDescription'),
      price: 4.97,
      checkoutPrice: 59.64,
      originalPrice: 12.99,
      interval: 'month',
      links: [
        {
          name: 'Credit Card',
          url: 'https://www.refinedsoft.com/shop-premium-features-discord-role/#/portal/signup/6881f5fb9c83c40001487e13/yearly',
          category: 'creditCard',
          cta: t('pages.premium.landingPage.subscribeWithCreditCard')
        },
        {
          name: 'SellApp',
          url: 'https://refinedsoft.sell.app/product/premium-yearly-crypto?payment_method=XMR',
          faviconDomain: 'https://sell.app',
          category: 'crypto',
          cta: t('pages.premium.landingPage.subscribeWithCrypto')
        }
      ]
    },
    {
      key: 'lifetime',
      name: t('pages.premium.landingPage.planLifetimeName'),
      description: t('pages.premium.landingPage.oneTimePayment'),
      price: 199.99,
      checkoutPrice: 199.99,
      originalPrice: 699.99,
      interval: 'once',
      links: [
        {
          name: 'SellApp',
          url: 'https://refinedsoft.sell.app/product/premium-lifetime',
          faviconDomain: 'https://sell.app',
          category: 'creditCard',
          cta: t('pages.premium.landingPage.payWithCreditCard')
        },
        {
          name: 'SellApp',
          url: 'https://refinedsoft.sell.app/product/premium-lifetime?payment_method=XMR',
          faviconDomain: 'https://sell.app',
          category: 'crypto',
          cta: t('pages.premium.landingPage.payWithCrypto')
        }
      ]
    }
  ])

  const faqs = computed(() => [
    { question: t('pages.premium.landingPage.faq1Question'), answer: t('pages.premium.landingPage.faq1Answer') },
    { question: t('pages.premium.landingPage.faq2Question'), answer: t('pages.premium.landingPage.faq2Answer') },
    { question: t('pages.premium.landingPage.faq3Question'), answer: t('pages.premium.landingPage.faq3Answer') },
    { question: t('pages.premium.landingPage.faq4Question'), answer: t('pages.premium.landingPage.faq4Answer') },
    { question: t('pages.premium.landingPage.faq5Question'), answer: t('pages.premium.landingPage.faq5Answer') },
    {
      question: t('pages.premium.landingPage.faq6Question'),
      answer: t('pages.premium.landingPage.faq6Answer', { name: project.name })
    }
  ])

  const selectedPaymentIntervalKey = ref<'monthly' | '30days' | 'yearly' | 'lifetime'>('monthly')

  const selectedPaymentInterval = computed(
    () => paymentIntervals.value.find((p) => p.key === selectedPaymentIntervalKey.value) ?? paymentIntervals.value[0]!
  )

  type MatomoWindow = Window & { _paq?: { push: (event: unknown[]) => void } }

  const isPaymentDialogOpen = ref(false)

  function onIntervalClick(interval: (typeof paymentIntervals.value)[0]) {
    selectedPaymentIntervalKey.value = interval.key as typeof selectedPaymentIntervalKey.value

    isPaymentDialogOpen.value = true
    ;(window as MatomoWindow)._paq?.push(['trackEvent', 'Premium', 'Plan Click', interval.key])
  }

  // Payment methods categorization
  const paymentMethods = computed(() => ({
    creditCard: {
      name: t('pages.premium.landingPage.creditCard'),
      icon: useFaviconUrl('mastercard.us')
    },
    crypto: {
      name: t('pages.premium.landingPage.cryptocurrency'),
      icon: useFaviconUrl('bitcoin.org')
    }
  }))

  const paymentMethodCategories = ['creditCard', 'crypto'] as const

  const selectedPaymentLinkGroups = computed(() =>
    paymentMethodCategories
      .map((category) => ({
        category,
        method: paymentMethods.value[category],
        links: selectedPaymentInterval.value.links.filter((link) => link.category === category)
      }))
      .filter((group) => group.links.length > 0)
  )

  useSeoMeta({
    title: computed(() => t('pages.premium.landingPage.seoTitle'))
  })

  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        { name: t('pages.premium.landingPage.seoTitle'), item: localePath('/premium') }
      ]
    }),
    defineProduct({
      name: project.name,
      // @see https://www.trustpilot.com/review/r34.app
      aggregateRating: {
        ratingValue: 4.5,
        ratingCount: 331
      }
    })
  ])
</script>

<template>
  <!-- Sign in -->
  <ClientOnly>
    <Teleport to="#navbar-actions">
      <NuxtLink
        :href="localePath('/premium/sign-in')"
        class="relative flex items-center gap-x-2 rounded-md p-2 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
      >
        <span class="text-sm text-base-content">{{ $t('pages.premium.landingPage.signIn') }}</span>

        <ArrowRightOnRectangleIcon class="h-6 w-6 text-base-content-highlight" />
      </NuxtLink>
    </Teleport>
  </ClientOnly>

  <main class="flex-1">
    <div class="container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
      <section
        id="pricing"
        class="grid items-start gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-14"
      >
        <div class="lg:sticky lg:top-24">
          <h1
            class="max-w-xl text-3xl leading-tight font-bold tracking-tight text-pretty text-base-content-highlight sm:text-5xl"
          >
            {{ $t('pages.premium.landingPage.heroTitle') }}
          </h1>

          <p class="mt-4 max-w-xl text-lg leading-7 font-medium text-pretty">
            {{ $t('pages.premium.landingPage.heroSubtitle') }}
          </p>

          <ol class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <li
              v-for="(mainFeature, index) in mainFeatures.slice(0, 4)"
              :key="mainFeature"
              :class="{ 'hidden sm:flex': index > 1 }"
              class="flex items-start gap-3 text-sm leading-6 text-base-content-highlight"
            >
              <CheckIcon
                aria-hidden="true"
                class="mt-0.5 h-5 w-5 flex-none text-primary-600"
              />
              <span>{{ mainFeature }}</span>
            </li>
          </ol>

          <NuxtLink
            :href="`https://www.trustpilot.com/review/${project.urls.production.hostname}`"
            class="mt-8 inline-flex items-center gap-3 rounded-lg px-3 py-2 ring-1 ring-base-0/10 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
            rel="nofollow noopener"
            target="_blank"
          >
            <span class="flex items-center gap-0.5">
              <StarIcon
                v-for="rating in [0, 1, 2, 3, 4]"
                :key="rating"
                aria-hidden="true"
                class="h-4 w-4 shrink-0 text-primary-600"
              />
            </span>
            <span class="text-sm">{{
              $t('pages.premium.landingPage.lovedByCustomers', { count: customerCount })
            }}</span>
          </NuxtLink>
        </div>

        <div>
          <h2 class="text-2xl font-bold tracking-tight text-base-content-highlight sm:text-3xl">
            {{ $t('pages.premium.landingPage.premiumPlans') }}
          </h2>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <article
              v-for="interval in paymentIntervals"
              :key="interval.name"
              class="relative flex min-h-64 flex-col rounded-2xl bg-base-1000/70 p-6 ring-1 ring-base-0/15 transition-colors hover:bg-base-0/5 hover:ring-base-0/30"
            >
              <p
                v-if="interval.originalPrice"
                class="absolute top-5 right-5 rounded-md bg-primary-700 px-2 py-1 text-xs font-semibold text-base-content-highlight"
              >
                {{
                  $t('pages.premium.landingPage.savePercent', {
                    percent: Math.round(((interval.originalPrice - interval.price) / interval.originalPrice) * 100)
                  })
                }}
              </p>

              <h3 class="pr-20 text-xl font-semibold tracking-tight text-base-content-highlight">
                {{ interval.name }}
              </h3>
              <p class="mt-1 min-h-10 text-sm leading-5 text-pretty">{{ interval.description }}</p>

              <div class="mt-6">
                <p
                  v-if="interval.originalPrice"
                  class="text-sm text-base-content line-through"
                >
                  €{{ interval.originalPrice }}
                </p>
                <p class="mt-1 text-4xl font-bold tracking-tight text-base-content-highlight">
                  €{{ interval.price }}
                  <span
                    v-if="interval.interval !== 'once'"
                    class="text-sm font-normal tracking-normal text-base-content"
                  >
                    /{{ $t('pages.premium.landingPage.perMonth') }}
                  </span>
                </p>
              </div>

              <button
                aria-describedby="premium-features"
                class="mt-auto rounded-lg bg-primary-700 px-4 py-3 text-center text-sm font-semibold text-base-content-highlight transition-colors hover:bg-primary-600 hover:hover-text-util focus-visible:focus-outline-util"
                @click="onIntervalClick(interval)"
              >
                {{ $t('pages.premium.landingPage.getPremium') }}
              </button>
            </article>
          </div>

          <p class="mt-5 text-center text-xs leading-5 text-base-content">
            {{ $t('pages.premium.landingPage.cancelAnytime') }}
            <span aria-hidden="true"> · </span>
            {{ $t('pages.premium.landingPage.safeDiscreetBilling') }}
          </p>

          <ClientOnly>
            <LazyPromotionalBanner
              v-if="shouldShow"
              class="mx-auto mt-6"
            />
          </ClientOnly>
        </div>
      </section>

      <section class="mt-16 sm:mt-24">
        <div
          class="scrollbar-hide grid snap-x snap-mandatory auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible lg:grid-cols-[1.35fr_1fr]"
        >
          <a
            href="#pricing"
            class="snap-start overflow-hidden rounded-2xl ring-1 ring-base-0/15 focus-visible:focus-outline-util sm:row-span-2"
          >
            <img
              :alt="$t('pages.premium.landingPage.featureNoAds')"
              class="aspect-square h-full w-full object-cover transition-transform duration-300 hover:scale-[1.015]"
              decoding="async"
              height="1280"
              loading="lazy"
              src="/img/promo/premium/No Ads.jpg"
              width="1280"
            />
          </a>
          <a
            href="#pricing"
            class="snap-start overflow-hidden rounded-2xl ring-1 ring-base-0/15 focus-visible:focus-outline-util"
          >
            <img
              :alt="$t('pages.premium.landingPage.featureDownload')"
              class="aspect-square h-full w-full object-cover transition-transform duration-300 hover:scale-[1.015]"
              decoding="async"
              height="1280"
              loading="lazy"
              src="/img/promo/premium/One-Click Downloads.jpg"
              width="1280"
            />
          </a>
          <a
            href="#pricing"
            class="snap-start overflow-hidden rounded-2xl ring-1 ring-base-0/15 focus-visible:focus-outline-util"
          >
            <img
              :alt="$t('pages.premium.landingPage.featureFindSource')"
              class="aspect-square h-full w-full object-cover transition-transform duration-300 hover:scale-[1.015]"
              decoding="async"
              height="1280"
              loading="lazy"
              src="/img/promo/premium/Source Finder.jpg"
              width="1280"
            />
          </a>
        </div>
      </section>

      <section class="mx-auto mt-16 max-w-5xl sm:mt-24">
        <div class="grid gap-5 md:grid-cols-2">
          <blockquote
            v-for="testimonial in testimonials"
            :key="testimonial.text"
            class="rounded-2xl bg-base-1000/50 p-6 ring-1 ring-base-0/10"
          >
            <p class="text-pretty text-base-content-highlight">“{{ testimonial.text }}”</p>
            <footer class="mt-3 text-xs">
              {{ $t('pages.premium.landingPage.fromSource', { source: testimonial.from }) }}
            </footer>
          </blockquote>
        </div>

        <NuxtLink
          :href="`https://www.trustpilot.com/review/${project.urls.production.hostname}`"
          class="mx-auto mt-8 block w-fit text-sm underline underline-offset-4 hover:hover-text-util focus-visible:focus-outline-util"
          rel="nofollow noopener"
          target="_blank"
        >
          {{ $t('pages.premium.landingPage.andManyMore') }}
        </NuxtLink>
      </section>

      <section
        id="premium-features"
        class="mx-auto mt-16 max-w-5xl rounded-2xl bg-base-1000/50 p-6 ring-1 ring-base-0/10 sm:mt-24 sm:p-10"
      >
        <h2 class="text-2xl font-bold tracking-tight text-base-content-highlight">
          {{ $t('pages.premium.landingPage.allPlansInclude') }}
        </h2>
        <p class="mt-2 max-w-2xl text-sm leading-6">
          {{
            $t('pages.premium.landingPage.featuresDescription', {
              count: completeBooruList.length - defaultBooruList.length,
              features: mainFeatures.length
            })
          }}
        </p>

        <ol class="mt-7 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          <li
            v-for="mainFeature in mainFeatures"
            :key="mainFeature"
            class="flex items-start gap-3 text-sm leading-6 text-base-content-highlight"
          >
            <CheckIcon
              aria-hidden="true"
              class="mt-0.5 h-5 w-5 flex-none text-primary-600"
            />
            <span>{{ mainFeature }}</span>
          </li>
        </ol>
      </section>

      <section class="mx-auto mt-16 max-w-3xl sm:mt-24">
        <h2 class="text-2xl font-bold tracking-tight text-base-content-highlight">
          {{ $t('pages.premium.landingPage.faqTitle') }}
        </h2>

        <dl class="mt-6 overflow-hidden rounded-2xl bg-base-1000/40 ring-1 ring-base-0/10">
          <Disclosure
            v-for="(faq, index) in faqs"
            :key="index"
            v-slot="{ open }"
            as="div"
            class="border-b border-base-0/10 last:border-b-0"
          >
            <dt>
              <DisclosureButton class="group flex w-full items-center justify-between gap-4 p-5 text-left">
                <span class="font-medium group-hover:text-base-content-highlight">{{ faq.question }}</span>
                <ChevronUpIcon
                  :class="!open ? 'rotate-180' : ''"
                  class="h-5 w-5 flex-none transition-transform duration-200 group-hover:text-base-content-highlight"
                />
              </DisclosureButton>
            </dt>
            <DisclosurePanel
              :unmount="false"
              as="dd"
              class="px-5 pb-5 text-sm whitespace-pre-line"
            >
              {{ faq.answer }}
            </DisclosurePanel>
          </Disclosure>
        </dl>
      </section>
    </div>
  </main>

  <!-- Payment Dialog -->
  <TransitionRoot
    :show="isPaymentDialogOpen"
    as="template"
  >
    <Dialog
      as="div"
      class="relative z-10"
      @close="isPaymentDialogOpen = false"
    >
      <!-- Background -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200 transition-opacity"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-base-1000/80 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative w-full transform overflow-hidden rounded-lg bg-base-1000 px-4 pt-5 pb-4 text-left shadow-xl ring-1 ring-base-0/10 transition-all sm:my-8 sm:max-w-lg sm:p-6"
            >
              <DialogTitle
                as="h3"
                class="text-lg leading-6 font-medium text-base-content-highlight"
              >
                {{ $t('pages.premium.landingPage.paymentDialogTitle', { name: selectedPaymentInterval.name }) }}
              </DialogTitle>

              <p class="mt-3 text-3xl font-bold tracking-tight text-base-content-highlight">
                €{{ selectedPaymentInterval.checkoutPrice }}
              </p>

              <p class="mt-1 text-sm text-base-content">
                {{ selectedPaymentInterval.description }}
              </p>

              <p class="mt-2 text-sm text-pretty text-base-content">
                {{ $t('pages.premium.landingPage.paymentDialogSubtitle') }}
              </p>

              <div class="mt-6 space-y-8">
                <div
                  v-for="group in selectedPaymentLinkGroups"
                  :key="group.category"
                  class="space-y-4"
                >
                  <!-- Section header -->
                  <div class="flex items-center gap-3">
                    <img
                      :alt="`${group.method.name} icon`"
                      :src="group.method.icon"
                      class="h-6 w-6 shrink-0 rounded-sm"
                      height="128"
                      width="128"
                    />
                    <h4 class="text-lg font-medium text-base-content-highlight">
                      {{ group.method.name }}
                    </h4>
                    <span
                      v-if="group.category === 'crypto'"
                      class="rounded-full bg-primary-700 px-2 py-0.5 text-xs font-semibold text-base-content-highlight"
                    >
                      {{ $t('promotions.percentOff', { percent: 20 }) }}
                    </span>
                  </div>

                  <!-- Payment links -->
                  <div class="grid gap-3">
                    <a
                      v-for="link in group.links"
                      :key="link.name"
                      :class="
                        link.category === 'crypto'
                          ? 'bg-primary-700/10 ring-primary-700/70 hover:bg-primary-700/20'
                          : 'hover:hover-bg-util'
                      "
                      :href="link.url"
                      class="flex items-center gap-2 rounded-lg px-3 py-2 text-center text-sm font-medium text-base-content-highlight ring-1 ring-base-0/20 hover:hover-text-util focus-visible:focus-outline-util"
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                    >
                      <img
                        :alt="`${link.name} favicon`"
                        :src="useFaviconUrl(link.faviconDomain ?? link.url)"
                        class="h-5 w-5 shrink-0 rounded-sm"
                        height="64"
                        width="64"
                      />
                      <span>
                        {{ link.cta }}
                      </span>
                    </a>
                  </div>

                  <!-- Instructions (only for links that have them) -->
                  <template
                    v-for="link in group.links"
                    :key="`${link.name}-instructions`"
                  >
                    <div v-if="'instructions' in link && link.instructions">
                      <ul class="mt-2 list-disc space-y-2 pl-4 text-sm text-base-content">
                        <li
                          v-for="(instruction, index) in link.instructions"
                          :key="index"
                        >
                          {{ instruction }}
                        </li>
                      </ul>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-6 sm:mt-8">
                <button
                  class="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-base-0/20 ring-inset hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                  type="button"
                  @click="isPaymentDialogOpen = false"
                >
                  {{ $t('common.close') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
