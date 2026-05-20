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
    { title: t('pages.premium.landingPage.featureNoAds'), additionalInfo: undefined },
    { title: t('pages.premium.landingPage.featureFasterImages'), additionalInfo: '#image-proxy' },
    {
      title: t('pages.premium.landingPage.featureAdditionalWebsites', {
        count: completeBooruList.length - defaultBooruList.length
      }),
      additionalInfo: '#additional-boorus'
    },
    { title: t('pages.premium.landingPage.featureSavePosts'), additionalInfo: '#save-posts' },
    { title: t('pages.premium.landingPage.featureDownload'), additionalInfo: '#download-posts' },
    { title: t('pages.premium.landingPage.featureFindSource'), additionalInfo: '#find-source' },
    { title: t('pages.premium.landingPage.featureHistory'), additionalInfo: '#history' },
    { title: t('pages.premium.landingPage.featureTagCollections'), additionalInfo: '#tag-collections' },
    { title: t('pages.premium.landingPage.featureBlockTags'), additionalInfo: '#tag-blocklist' },
    { title: t('pages.premium.landingPage.featureProxy'), additionalInfo: '#proxy' },
    { title: t('pages.premium.landingPage.featureDiscordRole'), additionalInfo: undefined },
    { title: t('pages.premium.landingPage.featureSupportDev'), additionalInfo: '#support-development' }
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
    <!-- Pricing -->
    <div class="isolate overflow-hidden">
      <div class="flow-root overflow-hidden py-6 sm:py-16 lg:pb-0">
        <div class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <!--          -->

          <!-- Header -->

          <div class="relative z-10">
            <!-- Title -->
            <h1 class="mx-auto max-w-4xl text-center text-2xl font-bold tracking-tight text-base-content-highlight">
              {{ $t('pages.premium.landingPage.heroTitle') }}
            </h1>

            <p class="mx-auto mt-3 max-w-3xl text-center text-lg leading-7 font-medium lg:mt-3">
              {{ $t('pages.premium.landingPage.heroSubtitle') }}
            </p>
          </div>

          <!-- CTA -->
          <div class="mt-10 flex justify-center">
            <a
              href="#pricing"
              class="mx-auto inline-flex items-center justify-center rounded-lg px-6 py-2 text-lg font-medium text-base-content-highlight ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
            >
              {{ $t('pages.premium.landingPage.getPremium') }}
            </a>
          </div>

          <!-- Rating -->
          <NuxtLink
            :href="`https://www.trustpilot.com/review/${project.urls.production.hostname}`"
            class="mt-16 flex flex-col items-center justify-center gap-3 pb-4 hover:hover-text-util focus-visible:focus-outline-util"
            rel="nofollow noopener"
            target="_blank"
          >
            <div class="flex items-center gap-0.5">
              <StarIcon
                v-for="rating in [0, 1, 2, 3, 4]"
                :key="rating"
                aria-hidden="true"
                class="h-6 w-6 shrink-0 text-base-content-highlight"
              />
            </div>

            <!-- TODO: Images of user profiles -->
            <span> {{ $t('pages.premium.landingPage.lovedByCustomers', { count: customerCount }) }}</span>
          </NuxtLink>

          <!-- Testimonials -->
          <section>
            <ol class="mt-4 space-y-6 px-6">
              <li
                v-for="testimonial in testimonials"
                :key="testimonial.text"
              >
                <span>“</span>
                <p class="inline text-pretty text-base-content-highlight">{{ testimonial.text }}</p>
                <span>”</span>

                <div class="mt-1.5 flex items-center gap-x-2 text-xs">
                  <span> {{ $t('pages.premium.landingPage.fromSource', { source: testimonial.from }) }} </span>
                </div>
              </li>
            </ol>

            <NuxtLink
              :href="`https://www.trustpilot.com/review/${project.urls.production.hostname}`"
              class="mx-auto mt-10 flex w-full max-w-fit gap-2.5 text-sm underline hover:hover-text-util focus-visible:focus-outline-util"
              rel="nofollow noopener"
              target="_blank"
            >
              {{ $t('pages.premium.landingPage.andManyMore') }}
            </NuxtLink>
          </section>

          <!-- Benefits -->
          <section>
            <!-- TODO: GIFs -->
          </section>

          <!-- Subscription -->
          <section
            id="pricing"
            class="relative mx-auto my-10 grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:max-w-none"
          >
            <!-- Background -->
            <svg
              aria-hidden="true"
              class="absolute -bottom-48 left-1/2 h-[64rem] -translate-x-1/2 translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] [clip-path:inset(0_0_63%_0)]"
              viewBox="0 0 1208 1024"
            >
              <ellipse
                cx="604"
                cy="512"
                fill="url(#d25c25d4-6d43-4bf9-b9ac-1842a30a4867)"
                rx="604"
                ry="512"
              />
              <defs>
                <radialGradient id="d25c25d4-6d43-4bf9-b9ac-1842a30a4867">
                  <stop stop-color="#7775D6" />
                  <stop
                    offset="1"
                    stop-color="#E935C1"
                  />
                </radialGradient>
              </defs>
            </svg>

            <h2 class="text-center text-2xl font-bold tracking-wide text-base-content-highlight">
              {{ $t('pages.premium.landingPage.premiumPlans') }}
            </h2>

            <!-- Promotional Banner -->
            <ClientOnly>
              <LazyPromotionalBanner
                v-if="shouldShow"
                class="mx-auto"
              />
            </ClientOnly>

            <!-- Features -->
            <div class="relative rounded-2xl bg-base-1000/70 ring-2 ring-base-0/10 backdrop-blur-sm">
              <div class="p-8 lg:pt-12 xl:p-10">
                <!-- -->

                <div>
                  <h3 class="text-2xl font-bold tracking-wide text-base-content-highlight">
                    {{ $t('pages.premium.landingPage.allPlansInclude') }}
                  </h3>

                  <p class="mt-2 text-sm leading-7">
                    {{
                      $t('pages.premium.landingPage.featuresDescription', {
                        count: completeBooruList.length - defaultBooruList.length,
                        features: mainFeatures.length
                      })
                    }}
                  </p>
                </div>

                <!-- Features -->
                <div class="mt-4 flow-root sm:mt-8">
                  <ol
                    id="premium-features"
                    class="space-y-1"
                    role="list"
                  >
                    <li
                      v-for="mainFeature in mainFeatures"
                      :key="mainFeature.title"
                      class="flex items-center gap-x-3 py-2"
                    >
                      <CheckIcon
                        aria-hidden="true"
                        class="h-6 w-5 flex-none text-primary-600"
                      />

                      <span class="flex-auto text-sm leading-6 text-base-content-highlight">
                        {{ mainFeature.title }}
                      </span>

                      <!-- TODO: Better linking -->
                      <!--                      <a-->
                      <!--                        v-if="mainFeature.additionalInfo"-->
                      <!--                        :href="mainFeature.additionalInfo"-->
                      <!--                        class="focus-visible:focus-outline-util hover:hover-text-util text-base-content"-->
                      <!--                      >-->
                      <!--                        <span class="sr-only">Learn more about this feature</span>-->

                      <!--                        <QuestionMarkCircleIcon class="h-5 w-5 flex-none" />-->
                      <!--                      </a>-->
                    </li>
                  </ol>
                </div>

                <!-- CTA -->
                <div class="mt-10 flex flex-col gap-6 lg:flex-col lg:items-stretch">
                  <!--                  <NuxtLink-->
                  <!--                    aria-describedby="premium-features"-->
                  <!--                    class="focus-visible:focus-outline-util hover:hover-text-util bg-primary-700 text-base-content-highlight hover:bg-primary-600 rounded-md px-3 py-2 text-center text-sm leading-6 font-semibold focus-visible:ring-offset-2"-->
                  <!--                    to="#pricing"-->
                  <!--                  >-->
                  <!--                    Get Premium-->
                  <!--                  </NuxtLink>-->

                  <p class="text-center text-xs leading-6">
                    {{ $t('pages.premium.landingPage.cancelAnytime') }}

                    <br />

                    {{ $t('pages.premium.landingPage.safeDiscreetBilling') }}

                    <br />

                    <NuxtLink
                      :href="`https://www.trustpilot.com/review/${project.urls.production.hostname}`"
                      class="hover:hover-text-util focus-visible:focus-outline-util"
                      rel="nofollow noopener"
                      target="_blank"
                    >
                      {{ $t('pages.premium.landingPage.trustedByCustomers', { count: customerCount }) }}
                    </NuxtLink>
                  </p>
                </div>
              </div>
            </div>

            <!-- Tiers -->
            <div
              v-for="interval in paymentIntervals"
              :key="interval.name"
              :class="{
                'ring-primary-700': interval.key === selectedPaymentInterval.key
              }"
              class="relative rounded-2xl bg-base-1000/70 ring-2 ring-base-0/10 backdrop-blur-sm"
            >
              <div class="p-6">
                <!-- -->

                <!-- Badge -->
                <div
                  v-if="interval.originalPrice"
                  class="absolute top-0 right-1/10"
                >
                  <div
                    :class="{
                      'bg-primary-700': interval.key === selectedPaymentInterval.key
                    }"
                    class="rounded-b-2xl bg-base-0/10 px-2 pt-3 pb-4"
                  >
                    <span
                      :class="{
                        'font-medium': interval.key === selectedPaymentInterval.key
                      }"
                      class="text-sm text-base-content-highlight"
                    >
                      {{
                        $t('pages.premium.landingPage.savePercent', {
                          percent: Math.round(
                            ((interval.originalPrice - interval.price) / interval.originalPrice) * 100
                          )
                        })
                      }}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 class="text-xl font-semibold tracking-wide text-base-content-highlight">
                    {{ interval.name }}
                  </h3>

                  <p class="mt-2 text-sm leading-3">
                    {{ interval.description }}
                  </p>
                </div>

                <!-- CTA -->
                <div class="flex flex-col gap-6 lg:flex-col lg:items-stretch">
                  <!-- Price -->
                  <div class="mt-10">
                    <p
                      v-if="interval.originalPrice"
                      class="text-sm text-base-content line-through"
                    >
                      €{{ interval.originalPrice }}
                    </p>

                    <div class="inline">
                      <p class="inline text-4xl font-bold tracking-tight text-base-content-highlight">
                        €{{ interval.price }}
                      </p>
                    </div>

                    <p
                      v-if="interval.interval !== 'once'"
                      class="ml-2 inline text-sm leading-5"
                    >
                      /{{ $t('pages.premium.landingPage.perMonth') }}
                    </p>
                  </div>

                  <!-- TODO: Media that attracts the attention of the user -->
                  <button
                    :class="{
                      'bg-primary-700 ring-0! hover:bg-primary-600!': interval.key === selectedPaymentInterval.key
                    }"
                    aria-describedby="premium-features"
                    class="rounded-lg px-3 py-2 text-center text-sm font-medium text-base-content-highlight ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
                    @click="onIntervalClick(interval)"
                  >
                    {{ $t('pages.premium.landingPage.getPremium') }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- FAQ -->
          <section class="mt-24">
            <h2 class="text-center text-2xl font-bold text-base-content-highlight">
              {{ $t('pages.premium.landingPage.faqTitle') }}
            </h2>

            <dl class="mt-8 divide-y divide-base-0/10">
              <Disclosure
                v-for="(faq, index) in faqs"
                :key="index"
                v-slot="{ open }"
                as="div"
                class="bg-1000 hover:bg-900 transition-colors duration-200"
              >
                <dt>
                  <DisclosureButton class="group flex w-full items-center justify-between gap-2 p-4">
                    <span class="font-medium group-hover:text-base-content-highlight">{{ faq.question }}</span>

                    <ChevronUpIcon
                      :class="!open ? 'rotate-180' : ''"
                      class="h-5 w-5 transition-transform duration-200 group-hover:text-base-content-highlight"
                    />
                  </DisclosureButton>
                </dt>

                <DisclosurePanel
                  :unmount="false"
                  as="dd"
                  class="px-4 pb-4 text-sm whitespace-pre-line"
                >
                  {{ faq.answer }}
                </DisclosurePanel>
              </Disclosure>
            </dl>
          </section>
        </div>
      </div>
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
