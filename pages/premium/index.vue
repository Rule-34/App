<script lang="ts" setup>
  import { CheckIcon, StarIcon } from '@heroicons/vue/20/solid'
  import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/solid'
  import { completeBooruList, defaultBooruList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'

  const mainFeatures = [
    { title: 'No ads', additionalInfo: undefined },
    {
      title: 'Access ' + (completeBooruList.length - defaultBooruList.length) + ' additional Boorus (websites)',
      additionalInfo: '#additional-boorus'
    },
    { title: 'Save posts', additionalInfo: '#save-posts' },
    { title: 'Download posts with one click', additionalInfo: '#download-posts' },
    { title: 'Find original source (artist) of posts', additionalInfo: '#find-source' },
    { title: 'Create tag collections', additionalInfo: '#tag-collections' },
    { title: 'Integrated history to resume browsing', additionalInfo: '#history' },
    { title: 'Integrated proxy to bypass website blocks', additionalInfo: '#proxy' },
    { title: 'Backup your data', additionalInfo: '#backup' },
    { title: 'Enjoy on any device or browser', additionalInfo: undefined },
    { title: '“Premium” Discord role', additionalInfo: undefined },
    { title: 'Support the development', additionalInfo: '#support-development' }
  ]

  useSeoMeta({
    title: 'Premium',

    description: 'Enhance your experience with no ads and exclusive features'
  })
</script>

<template>
  <!-- Sign in -->
  <SafeTeleport to="#navbar-actions">
    <NuxtLink
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util relative rounded-md p-2"
      href="/premium/sign-in"
    >
      <span class="sr-only">Sign in</span>

      <ArrowRightOnRectangleIcon class="h-6 w-6 text-base-content-highlight" />
    </NuxtLink>
  </SafeTeleport>

  <main class="flex-1">
    <!-- Pricing -->
    <section class="isolate overflow-hidden">
      <div class="flow-root overflow-hidden py-6 sm:py-16 lg:pb-0">
        <div class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <!-- Header -->
          <div class="relative z-10">
            <!-- Title -->
            <h1 class="mx-auto max-w-4xl text-center text-4xl font-bold tracking-tight text-base-content-highlight">
              Premium
            </h1>

            <p class="mx-auto mt-4 max-w-2xl text-center text-base leading-8 lg:mt-3">
              Enhance your experience with no ads and exclusive features
            </p>
          </div>

          <!-- Rating -->
          <NuxtLink
            class="focus-visible:focus-outline-util hover:hover-text-util mt-12 flex flex-col items-center justify-center gap-2.5 pb-4"
            href="https://gum.co/Rule34App#Ratings"
            target="_blank"
          >
            <div class="flex items-center">
              <StarIcon
                v-for="rating in [0, 1, 2, 3]"
                :key="rating"
                aria-hidden="true"
                class="h-5 w-5 flex-shrink-0 text-base-content-highlight"
              />

              <!-- Fix for half star https://github.com/tailwindlabs/heroicons/discussions/424 -->
              <svg
                aria-hidden="true"
                class="h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="something">
                    <stop
                      offset="70%"
                      stop-color="#e5e7eb"
                    />
                    <stop
                      offset="70%"
                      stop-color="#9ca3af"
                    />
                  </linearGradient>
                </defs>
                <path
                  clip-rule="evenodd"
                  d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                  fill="url(#something)"
                  fill-rule="evenodd"
                />
              </svg>
            </div>

            <span> Trusted by 1203+ customers</span>
          </NuxtLink>

          <!-- TODO: Images of user profiles -->
          <!-- TODO: Testimonials -->

          <!-- Body -->
          <div class="relative mx-auto my-10 grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:max-w-none">
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
                  <h2 class="text-2xl font-bold tracking-wide text-base-content-highlight">Premium</h2>

                  <p class="mt-2 text-sm leading-7">
                    Get access to {{ completeBooruList.length - defaultBooruList.length }} additional Boorus, and
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
                <div
                  class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-stretch"
                >
                  <!-- Price -->
                  <div class="mt-10 flex items-center justify-center gap-x-4">
                    <p class="text-4xl font-bold tracking-tight text-base-content-highlight">€4.9</p>

                    <div class="text-sm leading-5">
                      <p class="text-base-content">
                        EUR
                      </p>
                      <p>Billed monthly</p>
                    </div>
                  </div>

                  <div class="mb-1 text-center text-sm leading-6">
                    ✨ Cant afford it? Get up to

                    <span
                      class="inline-flex items-center gap-x-1.5 rounded-full bg-primary-400/20 px-2 py-0.5 font-medium leading-normal text-primary-400"
                    >
                      60% Off
                    </span>

                    in certain countries ✨
                  </div>

                  <NuxtLink
                    aria-describedby="premium-features"
                    class="focus-visible:focus-outline-util hover:hover-text-util rounded-md bg-primary-700 px-3 py-2 text-center text-sm font-semibold leading-6 text-base-content-highlight hover:bg-primary-600 focus-visible:ring-offset-2"
                    href="https://gum.co/Rule34App"
                    target="_blank"
                    onclick="window._paq?.push(['trackEvent', 'Premium', 'Subscribe Link Click'])"
                  >
                    Get Premium
                  </NuxtLink>

                  <p class="text-center text-xs leading-6">
                    Cancel anytime, subscription managed by

                    <NuxtLink
                      class="focus-visible:focus-outline-util hover:hover-text-util"
                      href="https://gumroad.com/discover"
                      target="_blank"
                    >
                      Gumroad
                    </NuxtLink>

                    <br />
                    Discreet credit card statement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature description -->
    <section>
      <!-- TODO: GIFs -->
    </section>

    <!-- Contact -->
    <section></section>
  </main>
</template>
