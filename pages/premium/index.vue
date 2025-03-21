<script lang="ts" setup>
  import { CheckIcon, StarIcon } from '@heroicons/vue/20/solid'
  import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/solid'
  import { completeBooruList, defaultBooruList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
  import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
  import { useCountdown } from '@vueuse/core'

  const customerCount = 2363

  const mainFeatures = [
    { title: 'No ads', additionalInfo: undefined },
    { title: 'Faster image loading', additionalInfo: '#image-proxy' },
    {
      title: 'Access ' + (completeBooruList.length - defaultBooruList.length) + ' additional websites',
      additionalInfo: '#additional-boorus'
    },
    { title: 'Save posts, synchronized on all devices', additionalInfo: '#save-posts' },
    { title: 'Download posts with one click', additionalInfo: '#download-posts' },
    { title: 'Find original source (artist) of posts', additionalInfo: '#find-source' },
    { title: 'Integrated history to resume browsing', additionalInfo: '#history' },
    { title: 'Create tag collections', additionalInfo: '#tag-collections' },
    { title: 'Create tag blocklist', additionalInfo: '#tag-blocklist' },
    { title: 'Proxy to bypass website blocked in your country', additionalInfo: '#proxy' },
    { title: '“Premium” Discord role', additionalInfo: undefined },
    { title: 'Support the development', additionalInfo: '#support-development' }
  ]

  const testimonials = [
    {
      text: 'You skip all the ads and focus on the porn',
      from: 'Discord'
    },
    {
      text: 'Basically THE hentai search engine for mobile',
      from: 'Feedback'
    },
    {
      text: 'Downloading videos is the best, and saving them for later is even better',
      from: 'Discord'
    },
    {
      text: "The extra websites make a difference, I've discovered so many new artists and content",
      from: 'Feedback'
    }
  ]

  const paymentIntervals = [
    {
      name: 'Monthly',
      description: 'Billed monthly',
      price: 7,
      originalPrice: 12.99,
      interval: 'month',
      links: [
        {
          name: 'Ko-fi',
          url: 'https://ko-fi.com/alejandro_akbal/tiers'
        },
        {
          name: 'Patreon',
          url: 'https://www.patreon.com/R34App'
        }
      ]
    },
    {
      name: '30 days access',
      description: 'One time payment',
      price: 12.99,
      originalPrice: undefined,
      interval: 'once',
      links: [
        {
          name: 'Ko-fi',
          url: 'https://ko-fi.com/s/4ff7beebad'
        }
      ]
    },
    {
      name: 'Yearly',
      description: 'Billed as €70.56',
      price: 5.88,
      originalPrice: 12.99,
      interval: 'month',
      links: [
        {
          name: 'Patreon',
          url: 'https://www.patreon.com/R34App',
          instructions: ['Make sure to select "Pay annually" on the Patreon page']
        }
      ]
    },
    {
      name: 'Lifetime',
      description: 'One time payment',
      price: 199.99,
      originalPrice: 699.99,
      interval: 'once',
      links: [
        {
          name: 'Ko-fi',
          url: 'https://ko-fi.com/s/4fa1d3781c'
        }
      ]
    }
  ]

  const selectedPaymentInterval = ref(paymentIntervals[0])

  const isPaymentDialogOpen = ref(false)

  // Countdown: 7 minutes
  const { remaining, start } = useCountdown(7 * 60, {
    onComplete() {
      // Reset the countdown when it completes
      start()
    },
    immediate: true
  })

  function onIntervalClick(interval: (typeof paymentIntervals)[0]) {
    selectedPaymentInterval.value = interval

    // If there's only one payment option and no instructions, directly open the link
    if (interval.links.length === 1 && !interval.links[0].instructions) {
      window.open(interval.links[0].url, '_blank', 'noreferrer noopener')
      return
    }

    isPaymentDialogOpen.value = true
  }

  function getFaviconUrl(url: string) {
    try {
      const hostname = new URL(url).hostname
      return `https://icons.duckduckgo.com/ip2/${hostname}.ico`
    } catch {
      return ''
    }
  }

  useSeoMeta({
    title: 'Premium'
  })
</script>

<template>
  <!-- Sign in -->
  <ClientOnly>
    <Teleport to="#navbar-actions">
      <NuxtLink
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util relative flex items-center gap-x-2 rounded-md p-2"
        href="/premium/sign-in"
      >
        <span class="text-base-content text-sm">Sign in</span>

        <ArrowRightOnRectangleIcon class="text-base-content-highlight h-6 w-6" />
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
            <h1 class="text-base-content-highlight mx-auto max-w-4xl text-center text-2xl font-bold tracking-tight">
              Browse Ad-free & Save Posts
            </h1>

            <p class="mx-auto mt-3 max-w-3xl text-center text-lg leading-7 font-medium lg:mt-3">
              Focus on Hentai without distractions, save posts to view them later, faster image loading and much more!
            </p>
          </div>

          <!-- CTA -->
          <div class="mt-10 flex justify-center">
            <NuxtLink
              class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util text-base-content-highlight ring-base-0/20 mx-auto inline-flex items-center justify-center rounded-lg px-6 py-2 text-lg font-medium ring-1"
              href="#pricing"
            >
              Get Premium
            </NuxtLink>
          </div>

          <!-- Rating -->
          <NuxtLink
            class="focus-visible:focus-outline-util hover:hover-text-util mt-16 flex flex-col items-center justify-center gap-3 pb-4"
            href="https://www.trustpilot.com/review/r34.app"
            rel="nofollow noopener"
            target="_blank"
          >
            <div class="flex items-center gap-0.5">
              <StarIcon
                v-for="rating in [0, 1, 2, 3, 4]"
                :key="rating"
                aria-hidden="true"
                class="text-base-content-highlight h-6 w-6 shrink-0"
              />
            </div>

            <!-- TODO: Images of user profiles -->
            <span> Loved by {{ customerCount }}+ customers</span>
          </NuxtLink>

          <!-- Testimonials -->
          <section>
            <ol class="mt-4 space-y-6 px-6">
              <li
                v-for="testimonial in testimonials"
                :key="testimonial.text"
              >
                <span>“</span>
                <p class="text-base-content-highlight inline">{{ testimonial.text }}</p>
                <span>”</span>

                <div class="mt-1.5 flex items-center gap-x-2 text-xs">
                  <span> from {{ testimonial.from }} </span>
                </div>
              </li>
            </ol>

            <NuxtLink
              class="focus-visible:focus-outline-util hover:hover-text-util mx-auto mt-10 flex w-full max-w-fit gap-2.5 text-sm underline"
              href="https://www.trustpilot.com/review/r34.app"
              rel="nofollow noopener"
              target="_blank"
            >
              And many more
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
              class="absolute -bottom-48 left-1/2 h-[64rem] -translate-x-1/2 translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
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

            <h2 class="text-base-content-highlight text-center text-2xl font-bold tracking-wide">Premium Plans</h2>

            <!-- Tier -->
            <div
              v-for="interval in paymentIntervals"
              :key="interval.name"
              :class="{
                'ring-primary-700': interval.name === selectedPaymentInterval.name
              }"
              class="bg-base-1000/70 ring-base-0/10 relative rounded-2xl ring-2 backdrop-blur-sm"
            >
              <div class="p-6">
                <!-- -->

                <!-- Badge -->
                <div
                  v-if="interval.originalPrice"
                  class="absolute top-0 right-1/8"
                >
                  <div
                    :class="{
                      'bg-primary-700': interval.name === selectedPaymentInterval.name
                    }"
                    class="bg-base-0/10 rounded-b-2xl px-2 pt-6 pb-4"
                  >
                    <span class="text-base-content-highlight font-medium">
                      -{{ Math.round(((interval.originalPrice - interval.price) / interval.originalPrice) * 100) }}%
                    </span>
                  </div>
                </div>

                <div>
                  <h3 class="text-base-content-highlight text-xl font-semibold tracking-wide">
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
                      class="text-base-content text-sm line-through"
                    >
                      €{{ interval.originalPrice }}
                    </p>

                    <div class="inline">
                      <p class="text-base-content-highlight inline text-4xl font-bold tracking-tight">
                        €{{ interval.price }}
                      </p>
                    </div>

                    <p class="ml-2 inline text-sm leading-5">/{{ interval.interval }}</p>
                  </div>

                  <button
                    :class="{
                      'bg-primary-700 hover:bg-primary-600! ring-0!': interval.name === selectedPaymentInterval.name
                    }"
                    aria-describedby="premium-features"
                    class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util text-base-content-highlight ring-base-0/20 rounded-lg px-3 py-2 text-center text-sm font-medium ring-1"
                    onclick="window._paq?.push(['trackEvent', 'Premium', 'Subscribe Interval', interval.name])"
                    @click="onIntervalClick(interval)"
                  >
                    Get Premium
                  </button>
                </div>
              </div>
            </div>

            <!-- Countdown Timer -->
            <div class="text-center tabular-nums">
              <div class="text-base-content mb-2 text-lg font-semibold">Offer ends in</div>

              <div class="flex justify-center gap-4 text-2xl font-bold">
                <div class="flex flex-col items-center">
                  <span class="text-base-content-highlight">{{ Math.floor(remaining / 3600) }}</span>
                  <span class="text-sm font-normal">Hours</span>
                </div>

                <div class="flex flex-col items-center">
                  <span class="text-base-content-highlight">{{ Math.floor((remaining % 3600) / 60) }}</span>
                  <span class="text-sm font-normal">Minutes</span>
                </div>

                <div class="flex flex-col items-center">
                  <span class="text-base-content-highlight">{{ remaining % 60 }}</span>
                  <span class="text-sm font-normal">Seconds</span>
                </div>
              </div>
            </div>

            <div class="bg-base-1000/70 ring-base-0/10 relative rounded-2xl ring-2 backdrop-blur-sm">
              <div class="p-8 lg:pt-12 xl:p-10">
                <!-- -->

                <div>
                  <h3 class="text-base-content-highlight text-2xl font-bold tracking-wide">
                    All plans include&hellip;
                  </h3>

                  <p class="mt-2 text-sm leading-7">
                    Access to {{ completeBooruList.length - defaultBooruList.length }} additional websites, and
                    {{ mainFeatures.length }} exclusive features!
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
                      <CheckIcon class="text-primary-600 h-6 w-5 flex-none" />

                      <span class="text-base-content-highlight flex-auto text-sm leading-6">
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
                  <NuxtLink
                    aria-describedby="premium-features"
                    class="focus-visible:focus-outline-util hover:hover-text-util bg-primary-700 text-base-content-highlight hover:bg-primary-600 rounded-md px-3 py-2 text-center text-sm leading-6 font-semibold focus-visible:ring-offset-2"
                    to="#pricing"
                  >
                    Get Premium
                  </NuxtLink>

                  <p class="text-center text-xs leading-6">
                    Cancel anytime

                    <br />

                    Safe and discreet billing

                    <br />

                    <NuxtLink
                      class="focus-visible:focus-outline-util hover:hover-text-util"
                      href="https://www.trustpilot.com/review/r34.app"
                      rel="nofollow noopener"
                      target="_blank"
                    >
                      Trusted by {{ customerCount }}+ customers
                    </NuxtLink>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- FAQ -->
          <section></section>
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
        <div class="bg-base-1000/80 fixed inset-0 backdrop-blur-sm" />
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
              class="bg-base-1000 ring-base-0/10 relative w-full transform overflow-hidden rounded-lg px-4 pt-5 pb-4 text-left shadow-xl ring-1 transition-all sm:my-8 sm:max-w-lg sm:p-6"
            >
              <DialogTitle
                as="h3"
                class="text-base-content-highlight text-lg leading-6 font-medium"
              >
                Payment Instructions - {{ selectedPaymentInterval.name }}
              </DialogTitle>

              <p
                v-if="selectedPaymentInterval.links.length > 1"
                class="text-base-content mt-2 text-sm text-pretty"
              >
                Choose one payment option to continue
              </p>

              <div class="mt-4 space-y-6">
                <div
                  v-for="link in selectedPaymentInterval.links"
                  :key="link.name"
                  class="space-y-4"
                >
                  <div class="flex items-center gap-3">
                    <img
                      :src="getFaviconUrl(link.url)"
                      :alt="`${link.name} favicon`"
                      class="h-5 w-5 shrink-0 rounded-sm"
                      height="128"
                      loading="eager"
                      width="128"
                    />
                    <h4 class="text-base-content-highlight font-medium">{{ link.name }}</h4>
                  </div>
                  <ol class="text-base-content list-decimal space-y-2 pl-4 text-sm">
                    <li
                      v-for="(instruction, index) in link.instructions"
                      :key="index"
                    >
                      {{ instruction }}
                    </li>
                  </ol>

                  <a
                    :href="link.url"
                    class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util text-base-content-highlight ring-base-0/20 rounded-lg px-3 py-2 text-center text-sm font-medium ring-1"
                    rel="nofollow noopener noreferrer"
                    target="_blank"
                  >
                    Continue to {{ link.name }}
                  </a>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-6 sm:mt-8">
                <button
                  class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset"
                  type="button"
                  @click="isPaymentDialogOpen = false"
                >
                  Dismiss
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
