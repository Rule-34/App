<script lang="ts" setup>
  import { CheckIcon } from '@heroicons/vue/20/solid'
  import { InformationCircleIcon } from '@heroicons/vue/24/outline'
  import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/solid'
  import { completeBooruList } from 'assets/lib/rule-34-shared-resources/src/util/BooruUtils'

  const mainFeatures = [
    { title: 'Additional Boorus (websites)', hasAdditionalInfo: true },
    { title: 'Save posts', hasAdditionalInfo: true },
    { title: 'One-click post download', hasAdditionalInfo: true },
    { title: 'Post image source finder', hasAdditionalInfo: true },
    { title: 'Tag collections', hasAdditionalInfo: true },
    { title: 'Page history', hasAdditionalInfo: true },
    { title: 'Backup your data', hasAdditionalInfo: true },
    { title: 'Integrated proxy to bypass website blocks', hasAdditionalInfo: true },
    { title: 'Hide promoted content', hasAdditionalInfo: false },
    { title: '“Premium” Discord role', hasAdditionalInfo: true },
    { title: 'Support the development', hasAdditionalInfo: false }
  ]

  useSeoMeta({
    title: 'Premium',

    description: 'Enhance your experience'
  })

  definePageMeta({
    middleware: 'auth',

    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/premium/dashboard'
    }
  })
</script>

<template>
  <!-- Sign in -->
  <!-- TODO: Make more obvious? -->
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
      <div class="flow-root overflow-hidden py-16 sm:pt-32 lg:pb-0">
        <div class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <!-- Header -->
          <div class="relative z-10">
            <!-- Title -->
            <h1 class="mx-auto max-w-4xl text-center text-4xl font-bold tracking-tight text-base-content-highlight">
              Premium
            </h1>

            <p class="mx-auto mt-4 max-w-2xl text-center text-lg leading-8">
              <!-- TODO: Improve description -->
              Enhance your experience
            </p>
          </div>

          <!-- Body -->
          <div class="relative mx-auto mt-10 grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:max-w-none">
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
              <div class="p-8 lg:pt-12 xl:p-10 xl:pt-14">
                <!-- -->

                <div>
                  <h2 class="text-2xl font-bold tracking-wide text-base-content-highlight">Premium</h2>

                  <p class="mt-2 text-sm leading-7">
                    Get access to {{ mainFeatures.length }} exclusive features, including
                    {{ completeBooruList.length }} additional Boorus!
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
                      <a
                        v-if="mainFeature.hasAdditionalInfo"
                        :href="`#${mainFeature.title}`"
                        class="focus-visible:focus-outline-util hover:hover-text-util text-base-content"
                      >
                        <span class="sr-only">Learn more about this feature</span>

                        <InformationCircleIcon class="h-5 w-5 flex-none" />
                      </a>
                    </li>
                  </ol>
                </div>

                <!-- CTA -->
                <div
                  class="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-stretch"
                >
                  <div class="flex items-center justify-center gap-x-4">
                    <p class="text-4xl font-bold tracking-tight text-base-content-highlight">€4.9</p>

                    <div class="text-sm leading-5">
                      <p class="text-base-content">EUR</p>
                      <p>Billed monthly</p>
                    </div>
                  </div>

                  <div class="text-center text-sm leading-6">
                    ✨ Up to

                    <span
                      class="inline-flex items-center gap-x-1.5 rounded-full bg-primary-400/20 px-2 py-0.5 font-medium leading-normal text-primary-400"
                    >
                      60% Off
                    </span>

                    in certain countries ✨
                  </div>

                  <a
                    aria-describedby="premium-features"
                    class="focus-visible:focus-outline-util hover:hover-text-util rounded-md bg-primary-700 px-3 py-2 text-center text-sm font-semibold leading-6 text-base-content-highlight hover:bg-primary-600 focus-visible:ring-offset-2"
                    href="https://gum.co/Rule34App"
                  >
                    Subscribe
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <!-- TODO: GIFs of features -->
    </section>
  </main>
</template>
