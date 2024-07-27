<script lang="ts" setup>
  import { CheckIcon, StarIcon } from '@heroicons/vue/20/solid'
  import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/solid'
  import { completeBooruList, defaultBooruList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'

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
    { title: 'Create tag collections (blocklist)', additionalInfo: '#tag-collections' },
    { title: 'Proxy to bypass website blocked in your country', additionalInfo: '#proxy' },
    { title: 'Use on any device or browser', additionalInfo: undefined },
    { title: 'Cancel anytime', additionalInfo: undefined },
    { title: '“Premium” Discord role', additionalInfo: undefined },
    { title: 'Support the development', additionalInfo: '#support-development' }
  ]

  const visibleEl = ref<HTMLElement | null>(null)

  const { $script } = useScript('https://cdn.sellix.io/static/js/embed.js', {
    use() {
      return window.initializeSellixEmbed
    },

    trigger: useScriptTriggerElement({ trigger: 'visible', el: visibleEl })
  })

  $script.then((initializeSellixEmbed) => {
    initializeSellixEmbed()
  })

  useSeoMeta({
    title: 'Premium'
  })
</script>

<template>
  <!-- Sign in -->
  <ClientOnly>
    <Teleport to="#navbar-actions">
      <NuxtLink
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util relative rounded-md p-2"
        href="/premium/sign-in"
      >
        <span class="sr-only">Sign in</span>

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
              Browse Ad-free & Save Posts
            </h1>

            <p class="mx-auto mt-3 max-w-3xl text-center text-lg font-medium leading-8 lg:mt-3">
              Focus on Hentai without distractions, save posts to view them later, faster image loading and much more!
            </p>
          </div>

          <!-- CTA -->
          <div class="mt-10 flex justify-center">
            <NuxtLink
              class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util mx-auto inline-flex items-center justify-center rounded-lg px-6 py-2 text-lg font-medium text-base-content-highlight ring-1 ring-base-0/20"
              href="#pricing"
            >
              Get Premium
            </NuxtLink>
          </div>

          <!-- Rating -->
          <NuxtLink
            class="focus-visible:focus-outline-util hover:hover-text-util mt-10 flex flex-col items-center justify-center gap-2.5 pb-4"
            href="https://www.trustpilot.com/review/r34.app"
            rel="nofollow noopener"
            target="_blank"
          >
            <div class="flex items-center">
              <StarIcon
                v-for="rating in [0, 1, 2, 3, 4]"
                :key="rating"
                aria-hidden="true"
                class="h-5 w-5 flex-shrink-0 text-base-content-highlight"
              />
            </div>

            <!-- TODO: Images of user profiles -->
            <span> Loved by 2163+ customers</span>
          </NuxtLink>

          <!-- TODO: Testimonials -->
          <section></section>

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

            <!-- Tier -->
            <div class="relative rounded-2xl bg-base-1000/70 ring-1 ring-base-0/10 backdrop-blur">
              <div class="p-8 lg:pt-12 xl:p-10">
                <!-- -->

                <div>
                  <h3 class="text-2xl font-bold tracking-wide text-base-content-highlight">Premium</h3>

                  <p class="mt-2 text-sm leading-7">
                    Get access to {{ completeBooruList.length - defaultBooruList.length }} additional websites, and
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
                      <CheckIcon class="h-6 w-5 flex-none text-primary-600" />

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
                <div class="flex flex-col gap-6 lg:flex-col lg:items-stretch">
                  <!-- Price -->
                  <div class="mt-10 flex items-center justify-center gap-x-4">
                    <p class="text-4xl font-bold tracking-tight text-base-content-highlight">€7</p>

                    <div class="text-sm leading-5">
                      <p class="text-base-content">EUR</p>
                      <p>Billed monthly</p>
                    </div>
                  </div>

                  <NuxtLink
                    aria-describedby="premium-features"
                    class="focus-visible:focus-outline-util hover:hover-text-util rounded-md bg-primary-700 px-3 py-2 text-center text-sm font-semibold leading-6 text-base-content-highlight hover:bg-primary-600 focus-visible:ring-offset-2"
                    onclick="window._paq?.push(['trackEvent', 'Premium', 'Subscribe Link Click'])"
                    rel="noopener nofollow"
                    target="_blank"
                    to="https://www.patreon.com/bePatron?u=135693332"
                  >
                    Get Premium
                  </NuxtLink>

                  <button
                    ref="visibleEl"
                    aria-describedby="premium-features"
                    class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 hover:bg-primary-600 focus-visible:ring-offset-2"
                    data-sellix-product="668f8f7c7c348"
                    onclick="window._paq?.push(['trackEvent', 'Premium', 'Subscribe Link Click', 'Crypto'])"
                    type="button"
                  >
                    Get Premium with Crypto
                  </button>

                  <p class="text-center text-xs leading-6">
                    Subscription managed by

                    <NuxtLink
                      class="focus-visible:focus-outline-util hover:hover-text-util"
                      href="https://www.patreon.com"
                      rel="nofollow noopener"
                      target="_blank"
                    >
                      Patreon
                    </NuxtLink>

                    <br />

                    Discreet “PATREON” credit card statement
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
</template>
