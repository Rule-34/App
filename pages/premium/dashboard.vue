<script lang="ts" setup>
  import { ArrowLeftOnRectangleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'
  import { toast } from 'vue-sonner'
  import { Platform, PLATFORM_URLS, detectPlatform } from '~/types/enums/Platform'
  import formbricks from '~/assets/js/formbricks'

  const { $pocketBase } = useNuxtApp()

  const { email, license, isPremium } = useUserData()

  const links = [
    {
      name: 'Saved posts',
      description: 'Save posts and enjoy them later',
      href: '/premium/saved-posts/r34.app'
    },
    {
      name: 'Tag collections',
      description: 'Create lists of tags to quickly search or filter posts',
      href: '/premium/tag-collections'
    },
    {
      name: 'Additional Boorus',
      description: 'Browse posts from additional websites',
      href: '/premium/additional-boorus'
    },
    {
      name: 'Backup & Restore',
      description: 'Backup your tag collections and settings',
      href: '/premium/backup'
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
    formbricks.track('cancel_subscription_click_on_dashboard')

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
    if (!import.meta.client || !route.query.initialLogin) {
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
    <!-- TODO: Add thank you note -->

    <PageHeader>
      <template #title>Premium dashboard</template>
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

    <!-- TODO: Show if the user is premium -->
    <div
      v-if="!isPremium"
      class="text-base-content-highlight mt-4 text-sm text-pretty"
    >
      <div class="mb-2 flex items-center gap-1">
        <ExclamationTriangleIcon class="text-base-content-highlight inline h-6 w-6" />

        <h2 class="text-base underline">Your subscription has expired</h2>
      </div>

      <p>Your account is in a read-only state, you can still view your saved posts, but you can't create new ones</p>

      <p>To continue enjoying Premium features, subscribe again</p>

      <NuxtLink
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 mt-4 flex items-center justify-center rounded-md px-3 py-1.5 text-base ring-1 md:inline-flex"
        href="/premium#pricing"
      >
        Subscribe now
      </NuxtLink>
    </div>

    <!-- Links -->
    <section>
      <ol class="mt-6 space-y-4">
        <!-- -->

        <NuxtLink
          v-for="link in links"
          :key="link.name"
          :href="link.href"
          class="hover:hover-bg-util focus-visible:focus-outline-util border-base-0/20 block w-full rounded-md border px-4 py-3"
        >
          <h2 class="text-base-content-highlight text-lg font-bold tracking-tight">
            {{ link.name }}
          </h2>

          <p class="text-sm">
            {{ link.description }}
          </p>
        </NuxtLink>

        <!-- Feedback -->
        <!-- TODO: add more distinction -->
        <NuxtLink
          class="hover:hover-bg-util focus-visible:focus-outline-util border-base-0/20 block max-w-[95%] rounded-md rounded-br-3xl border px-4 py-3"
          href="https://forms.gle/9FAZRegzJ8VAzT5F9"
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          <h2 class="text-base-content-highlight text-lg font-bold tracking-tight">Feedback</h2>

          <p class="text-sm">Have a suggestion or found a bug? Let me know!</p>
        </NuxtLink>
      </ol>
    </section>

    <!-- Manage subscription -->
    <section class="absolute inset-x-0 bottom-0 w-full space-x-2 p-4 text-center">
      <NuxtLink
        class="hover:hover-text-util focus-visible:focus-outline-util underline"
        href="mailto:contact@r34.app"
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        <!-- @formatter:off -->
        Contact support</NuxtLink
      >

      <span> &middot; </span>

      <button
        class="hover:hover-text-util focus-visible:focus-outline-util underline"
        type="button"
        @click="onManageSubscriptionClick"
      >
        Manage subscription
      </button>
    </section>
  </main>
</template>
