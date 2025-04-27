<script lang="ts" setup>
  import {
    ArchiveBoxIcon,
    ArrowLeftOnRectangleIcon,
    BookmarkIcon,
    ChatBubbleBottomCenterTextIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    HeartIcon,
    TagIcon
  } from '@heroicons/vue/24/solid'
  import { toast } from 'vue-sonner'
  import { detectPlatform, Platform, PLATFORM_URLS } from '~/types/enums/Platform'

  const { $pocketBase } = useNuxtApp()
  const route = useRoute()

  const { email, license, isPremium } = useUserData()

  const isInitialLogin = computed(() => Boolean(route.query.initialLogin))

  const links = [
    {
      name: 'Saved posts',
      description: 'Save posts and enjoy them later',
      href: '/premium/saved-posts/r34.app',
      icon: BookmarkIcon
    },
    {
      name: 'Tag collections',
      description: 'Create lists of tags to quickly search or filter posts',
      href: '/premium/tag-collections',
      icon: TagIcon
    },
    {
      name: 'Additional Boorus',
      description: 'Browse posts from additional websites',
      href: '/premium/additional-boorus',
      icon: GlobeAltIcon
    },
    {
      name: 'Backup & Restore',
      description: 'Backup your tag collections and settings',
      href: '/premium/backup',
      icon: ArchiveBoxIcon
    }
  ]

  async function signOut() {
    // Log out from pocketbase
    $pocketBase.authStore.clear()

    window.location.href = '/premium/sign-in'
  }

  const platformOfPurchase = computed<Platform | undefined>(() => detectPlatform(license.value))

  function onManageSubscriptionClick() {
    // TODO: Only continue if form finished
    window.formbricks?.track('cancel_subscription_click_on_dashboard')

    if (!platformOfPurchase.value) {
      toast.error('Cant find the platform where you purchased your subscription')
      return
    }

    window.open(PLATFORM_URLS[platformOfPurchase.value], '_blank', 'noopener,noreferrer')

    window._paq?.push(['trackEvent', 'Premium', 'Click "Manage subscription"', platformOfPurchase.value])
  }

  onNuxtReady(() => {
    const route = useRoute()
    const message = route.query.message

    if (message) {
      toast.success(message)
    }

    // --- Event Tracking: user subscribed --- >
    if (!import.meta.client || !isInitialLogin) {
      return
    }

    const userRecord = $pocketBase.authStore.record
    const isAuthenticated = $pocketBase.authStore.isValid

    if (!isAuthenticated || !userRecord?.created) {
      return
    }

    const TIME_AGO_IN_MS = 2 * 24 * 60 * 60 * 1000 // 2 days
    const timeAgo = new Date(Date.now() - TIME_AGO_IN_MS)
    const createdAt = new Date(userRecord.created) // Assumes valid ISO 8601 string

    const isRecentlyCreated = createdAt > timeAgo

    if (!isRecentlyCreated) {
      return
    }

    window._paq?.push(['trackEvent', 'Premium', 'Subscribed', platformOfPurchase.value])
    // <--- Event Tracking ---
  })

  useSeoMeta({
    title: 'Premium dashboard'
  })

  definePageMeta({
    middleware: ['auth']
  })
</script>

<template>
  <!-- Sign out -->
  <ClientOnly>
    <Teleport to="#navbar-actions">
      <button
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util relative rounded-md p-2"
        type="button"
        @click="signOut"
      >
        <span class="sr-only">Sign out</span>

        <ArrowLeftOnRectangleIcon class="text-base-content-highlight h-6 w-6" />
      </button>
    </Teleport>
  </ClientOnly>

  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <!-- -->

    <!-- Status -->
    <PageHeader>
      <template #title>Dashboard</template>
      <template #text>
        <p class="truncate">
          Signed in as

          <span
            class="bg-primary-400/10 text-primary-400 ring-primary-400/20 inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset"
          >
            {{ email || '?' }}
          </span>
        </p>
      </template>
    </PageHeader>

    <!-- Premium Status -->
    <div
      v-if="isInitialLogin"
      class="bg-primary-400/10 text-primary-400 ring-primary-400/20 mt-4 rounded-md p-4 text-sm text-pretty ring-1 ring-inset"
    >
      <div class="mb-2 flex items-center gap-2">
        <HeartIcon class="text-primary-400 h-6 w-6" />

        <h2 class="text-base font-medium">Thank you for your support</h2>
      </div>

      <p>Enjoy ad-free browsing, saving posts and all Premium features!</p>
    </div>

    <!-- Expired Subscription Warning -->
    <div
      v-if="!isPremium"
      class="border-base-0/20 mt-4 rounded-md border p-4 text-sm text-pretty"
    >
      <div class="mb-2 flex items-center gap-2">
        <ExclamationTriangleIcon class="h-6 w-6 text-yellow-400" />
        <h2 class="text-base font-medium">Your subscription has expired</h2>
      </div>

      <p>Your account is in a read-only state, you can still view your saved posts, but you can't create new ones</p>

      <p class="mt-2">To continue enjoying Premium features, subscribe again</p>

      <NuxtLink
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 mt-4 flex items-center justify-center rounded-md px-3 py-1.5 text-base ring-1 md:inline-flex"
        href="/premium#pricing"
      >
        Subscribe now
      </NuxtLink>
    </div>

    <!-- Premium Features -->
    <section class="mt-8">
      <h2 class="text-base-content-highlight mb-4 text-xl font-bold">Premium Features</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="link in links"
          :key="link.name"
          :href="link.href"
          class="hover:hover-bg-util focus-visible:focus-outline-util border-base-0/20 flex flex-col rounded-md border p-4 transition-all duration-200 hover:shadow-md"
        >
          <div class="mb-2 flex items-center gap-2">
            <component
              :is="link.icon"
              class="text-primary-400 h-6 w-6"
            />
            <h3 class="text-base-content-highlight text-lg font-bold tracking-tight">
              {{ link.name }}
            </h3>
          </div>
          <p class="text-sm">
            {{ link.description }}
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- Feedback -->
    <section class="mt-8">
      <NuxtLink
        class="hover:hover-bg-util focus-visible:focus-outline-util bg-base-0/5 border-base-0/20 flex items-start rounded-md border p-4 transition-all duration-200 hover:shadow-md"
        href="https://feedback.r34.app"
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        <ChatBubbleBottomCenterTextIcon class="text-primary-400 mt-1 mr-3 h-6 w-6 flex-shrink-0" />
        <div>
          <h2 class="text-base-content-highlight text-lg font-bold tracking-tight">Feedback</h2>
          <p class="text-sm">
            Have a suggestion or found a bug? Let me know! Your feedback helps improve the app for everyone.
          </p>
        </div>
      </NuxtLink>
    </section>

    <!-- Support & Subscription Management -->
    <section class="border-base-0/10 mt-4 mb-3 border-t pt-6">
      <div class="flex flex-row items-center justify-center gap-4">
        <NuxtLink
          class="hover:hover-bg-util focus-visible:focus-outline-util border-base-0/20 flex items-center gap-2 rounded-md border px-4 py-2 transition-all duration-200"
          href="mailto:contact@r34.app"
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          <span class="text-sm font-medium">Contact Support</span>
        </NuxtLink>

        <button
          class="hover:hover-bg-util focus-visible:focus-outline-util border-base-0/20 flex items-center gap-2 rounded-md border px-4 py-2 transition-all duration-200"
          type="button"
          @click="onManageSubscriptionClick"
        >
          <span class="text-sm font-medium">Manage Subscription</span>
        </button>
      </div>
    </section>
  </main>
</template>
