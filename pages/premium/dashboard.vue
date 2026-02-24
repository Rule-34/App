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
  import { project } from '@/config/project'

  const { $pocketBase } = useNuxtApp()
  const route = useRoute()

  const { email, license, isPremium } = useUserData()

  const discordOauthUrl = computed(() => {
    const { clientId, redirectUri } = project.discordOauth

    if (!clientId || !redirectUri) {
      return null
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify guilds.join'
    })

    return `https://discord.com/oauth2/authorize?${params.toString()}`
  })

  const isInitialLogin = computed(() => Boolean(route.query.initialLogin))

  const links = [
    {
      name: 'Saved posts',
      description: 'Save posts and enjoy them later',
      href: `/premium/saved-posts/${project.urls.production.hostname}`,
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
        aria-label="Sign out"
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util relative rounded-md p-2"
        type="button"
        @click="signOut"
      >
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
        <ExclamationTriangleIcon
          aria-hidden="true"
          class="h-6 w-6 text-yellow-400"
        />
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

        <!-- Discord role; duplicate because of the different icon -->
        <NuxtLink
          target="_blank"
          rel="noopener noreferrer"
          v-if="discordOauthUrl"
          :href="discordOauthUrl"
          class="hover:hover-bg-util focus-visible:focus-outline-util border-base-0/20 flex flex-col rounded-md border p-4 transition-all duration-200 hover:shadow-md"
        >
          <div class="mb-2 flex items-center gap-2">
            <svg
              aria-hidden="true"
              class="text-primary-400 h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19.952 5.672c-1.904-1.531-4.916-1.79-5.044-1.801-.201-.017-.392.097-.474.281-.006.012-.072.163-.145.398 1.259.212 2.806.64 4.206 1.509.224.139.293.434.154.659-.09.146-.247.226-.407.226-.086 0-.173-.023-.252-.072C15.584 5.38 12.578 5.305 12 5.305s-3.585.075-5.989 1.567c-.225.14-.519.07-.659-.154-.14-.225-.07-.519.154-.659 1.4-.868 2.946-1.297 4.206-1.509-.074-.236-.14-.386-.145-.398-.083-.184-.273-.3-.475-.28-.127.01-3.139.269-5.069 1.822C3.015 6.625 1 12.073 1 16.783c0 .083.022.165.063.237 1.391 2.443 5.185 3.083 6.05 3.111h.015c.153 0 .297-.073.387-.197l.875-1.202c-2.359-.61-3.564-1.645-3.634-1.706-.198-.175-.217-.477-.042-.675.175-.198.476-.217.674-.043.029.026 2.248 1.909 6.612 1.909 4.372 0 6.591-1.891 6.613-1.91.198-.172.5-.154.674.045.174.198.155.499-.042.673-.07.062-1.275 1.096-3.634 1.706l.875 1.202c.09.124.234.197.387.197h.015c.865-.027 4.659-.667 6.05-3.111.04-.072.062-.153.062-.236 0-4.71-2.015-10.158-3.048-11.111zM8.891 14.87c-.924 0-1.674-.857-1.674-1.913s.749-1.913 1.674-1.913 1.674.857 1.674 1.913-.749 1.913-1.674 1.913zm6.218 0c-.924 0-1.674-.857-1.674-1.913s.749-1.913 1.674-1.913c.924 0 1.674.857 1.674 1.913s-.75 1.913-1.674 1.913z"
              />
            </svg>
            <h3 class="text-base-content-highlight text-lg font-bold tracking-tight">Claim Discord role</h3>
          </div>
          <p class="text-sm">Connect Discord to get the Premium role</p>
        </NuxtLink>
      </div>
    </section>

    <!-- Feedback -->
    <section class="mt-8">
      <NuxtLink
        class="hover:hover-bg-util focus-visible:focus-outline-util bg-base-0/5 border-base-0/20 flex items-start rounded-md border p-4 transition-all duration-200 hover:shadow-md"
        :href="`https://feedback.${project.urls.production.hostname}`"
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
          :href="`mailto:${project.email}`"
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
