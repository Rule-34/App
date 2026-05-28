<script lang="ts" setup>
  import {
    ArrowLeftOnRectangleIcon,
    BookmarkIcon,
    EllipsisVerticalIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    HeartIcon,
    TrashIcon,
    TagIcon
  } from '@heroicons/vue/24/solid'
  import type { Platform } from '~/types/enums/Platform'
  import { detectPlatform, PLATFORM_URLS } from '~/types/enums/Platform'
  import { project } from '~~/config/project'

  const { $pocketBase } = useNuxtApp()
  const route = useRoute()
  const localePath = useLocalePath()
  const { t } = useI18n()
  const { toast } = useLazyToast()

  const { email, license, isPremium } = useUserData()
  const { deleteCloudData, deleteAccount } = usePremiumCloudSync()

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

  const links = computed(() => [
    {
      name: t('pages.premium.dashboard.savedPostsName'),
      description: t('pages.premium.dashboard.savedPostsDescription'),
      href: localePath(`/premium/saved-posts/${project.urls.production.hostname}`),
      icon: BookmarkIcon
    },
    {
      name: t('pages.premium.dashboard.tagCollectionsName'),
      description: t('pages.premium.dashboard.tagCollectionsDescription'),
      href: localePath('/premium/tag-collections'),
      icon: TagIcon
    },
    {
      name: t('pages.premium.dashboard.additionalBoorusName'),
      description: t('pages.premium.dashboard.additionalBoorusDescription'),
      href: localePath('/premium/additional-boorus'),
      icon: GlobeAltIcon
    }
  ])

  async function signOut() {
    // Log out from pocketbase
    $pocketBase.authStore.clear()

    window.location.href = localePath('/premium/sign-in')
  }

  const platformOfPurchase = computed<Platform | undefined>(() => detectPlatform(license.value))
  const cancellationSupportEmailHref = computed(() => {
    const params = new URLSearchParams({
      subject: t('pages.premium.dashboard.cancellationSupportEmailSubject'),
      body: t('pages.premium.dashboard.cancellationSupportEmailBody', {
        email: email.value || '?',
        license: license.value || '?'
      })
    })

    return `mailto:${project.email}?${params.toString()}`
  })

  type MatomoWindow = Window & { _paq?: { push: (event: unknown[]) => void } }

  function getMatomoQueue() {
    return (window as MatomoWindow)._paq
  }

  function onManageSubscriptionClick() {
    // TODO: Only continue if form finished
    window.formbricks?.track('cancel_subscription_click_on_dashboard')

    if (!platformOfPurchase.value) {
      window.location.href = cancellationSupportEmailHref.value
      getMatomoQueue()?.push(['trackEvent', 'Premium', 'Click "Subscription support fallback"'])
      return
    }

    window.open(PLATFORM_URLS[platformOfPurchase.value], '_blank', 'noopener,noreferrer')

    getMatomoQueue()?.push(['trackEvent', 'Premium', 'Click "Cancel or manage subscription"', platformOfPurchase.value])
  }

  async function onDeleteCloudDataClick() {
    if (!confirm(t('pages.premium.dashboard.deleteCloudDataConfirm'))) {
      return
    }

    if (await deleteCloudData()) {
      toast.success(t('toasts.cloudDataDeleted'))
      window.location.reload()
    }
  }

  async function onDeleteAccountClick() {
    const confirmationValue = email.value || license.value

    if (!confirmationValue) {
      return
    }

    const confirmedValue = prompt(
      `${t('pages.premium.dashboard.deleteAccountConfirm', { value: confirmationValue })}\n\n${t('pages.premium.dashboard.deleteAccountBillingNote')}`
    )

    if (confirmedValue !== confirmationValue) {
      toast.error(t('toasts.accountDeletionCancelled'))
      return
    }

    if (await deleteAccount()) {
      window.location.href = localePath('/premium')
    }
  }

  onNuxtReady(() => {
    // --- Event Tracking: user subscribed --- >
    if (!import.meta.client || !isInitialLogin.value) {
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

    getMatomoQueue()?.push(['trackEvent', 'Premium', 'Subscribed', platformOfPurchase.value])
    // <--- Event Tracking ---
  })

  useSeoMeta({
    title: computed(() => t('pages.premium.dashboard.seoTitle'))
  })

  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        { name: t('pages.premium.landingPage.seoTitle'), item: localePath('/premium') },
        { name: t('pages.premium.dashboard.seoTitle'), item: localePath('/premium/dashboard') }
      ]
    })
  ])

  definePageMeta({
    middleware: ['auth']
  })
</script>

<template>
  <!-- Account actions -->
  <ClientOnly>
    <Teleport to="#navbar-actions">
      <HeadlessMenu
        as="div"
        class="relative"
      >
        <HeadlessMenuButton
          :aria-label="t('pages.premium.dashboard.moreAccountActions')"
          class="relative rounded-md p-2 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
          type="button"
        >
          <EllipsisVerticalIcon class="h-6 w-6 text-base-content-highlight" />
        </HeadlessMenuButton>

        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <HeadlessMenuItems
            class="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-base-1000 py-1 shadow-lg ring-1 ring-base-0/20 focus:outline-hidden"
          >
            <HeadlessMenuItem v-slot="{ active }">
              <button
                :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
                class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm"
                type="button"
                @click="onDeleteCloudDataClick"
              >
                <TrashIcon class="h-4 w-4 text-red-300" />
                {{ t('pages.premium.dashboard.deleteCloudData') }}
              </button>
            </HeadlessMenuItem>

            <HeadlessMenuItem v-slot="{ active }">
              <button
                :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
                class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm"
                type="button"
                @click="onDeleteAccountClick"
              >
                <TrashIcon class="h-4 w-4 text-red-300" />
                {{ t('pages.premium.dashboard.deleteAccount') }}
              </button>
            </HeadlessMenuItem>
          </HeadlessMenuItems>
        </Transition>
      </HeadlessMenu>

      <button
        :aria-label="t('pages.premium.dashboard.signOutLabel')"
        class="relative rounded-md p-2 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="signOut"
      >
        <ArrowLeftOnRectangleIcon class="h-6 w-6 text-base-content-highlight" />
      </button>
    </Teleport>
  </ClientOnly>

  <main class="container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <!-- -->

    <!-- Status -->
    <PageHeader>
      <template #title>{{ $t('pages.premium.dashboard.pageTitle') }}</template>
      <template #text>
        <p class="truncate">
          {{ $t('pages.premium.dashboard.signedInAs') }}

          <span
            class="inline-flex items-center rounded-md bg-primary-400/10 px-2 py-1 text-sm font-medium text-primary-400 ring-1 ring-primary-400/20 ring-inset"
          >
            {{ email || '?' }}
          </span>
        </p>
      </template>
    </PageHeader>

    <!-- Premium Status -->
    <div
      v-if="isInitialLogin"
      class="mt-4 rounded-md bg-primary-400/10 p-4 text-sm text-pretty text-primary-400 ring-1 ring-primary-400/20 ring-inset"
    >
      <div class="mb-2 flex items-center gap-2">
        <HeartIcon class="h-6 w-6 text-primary-400" />

        <h2 class="text-base font-medium">{{ $t('pages.premium.dashboard.thankYouTitle') }}</h2>
      </div>

      <p>{{ $t('pages.premium.dashboard.thankYouText') }}</p>
    </div>

    <!-- Expired Subscription Warning -->
    <div
      v-if="!isPremium"
      class="mt-4 rounded-md border border-base-0/20 p-4 text-sm text-pretty"
    >
      <div class="mb-2 flex items-center gap-2">
        <ExclamationTriangleIcon
          aria-hidden="true"
          class="h-6 w-6 text-yellow-400"
        />
        <h2 class="text-base font-medium">{{ $t('pages.premium.dashboard.expiredTitle') }}</h2>
      </div>

      <p>{{ $t('pages.premium.dashboard.expiredText') }}</p>

      <p class="mt-2">{{ $t('pages.premium.dashboard.resubscribeText') }}</p>

      <NuxtLink
        class="mt-4 flex items-center justify-center rounded-md px-3 py-1.5 text-base ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util md:inline-flex"
        :href="localePath('/premium#pricing')"
      >
        {{ $t('pages.premium.dashboard.subscribeNow') }}
      </NuxtLink>
    </div>

    <!-- Premium Features -->
    <section class="mt-8">
      <h2 class="mb-4 text-xl font-bold text-base-content-highlight">
        {{ $t('pages.premium.dashboard.featuresTitle') }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="link in links"
          :key="link.name"
          :href="link.href"
          class="flex flex-col rounded-md border border-base-0/20 p-4 transition-all duration-200 hover:hover-bg-util hover:shadow-md focus-visible:focus-outline-util"
        >
          <div class="mb-2 flex items-center gap-2">
            <component
              :is="link.icon"
              class="h-6 w-6 text-primary-400"
            />
            <h3 class="text-lg font-bold tracking-tight text-base-content-highlight">
              {{ link.name }}
            </h3>
          </div>
          <p class="text-sm">
            {{ link.description }}
          </p>
        </NuxtLink>

        <!-- Discord role; duplicate because of the different icon -->
        <NuxtLink
          v-if="discordOauthUrl"
          target="_blank"
          rel="noopener noreferrer"
          :href="discordOauthUrl"
          class="flex flex-col rounded-md border border-base-0/20 p-4 transition-all duration-200 hover:hover-bg-util hover:shadow-md focus-visible:focus-outline-util"
        >
          <div class="mb-2 flex items-center gap-2">
            <svg
              aria-hidden="true"
              class="h-6 w-6 text-primary-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19.952 5.672c-1.904-1.531-4.916-1.79-5.044-1.801-.201-.017-.392.097-.474.281-.006.012-.072.163-.145.398 1.259.212 2.806.64 4.206 1.509.224.139.293.434.154.659-.09.146-.247.226-.407.226-.086 0-.173-.023-.252-.072C15.584 5.38 12.578 5.305 12 5.305s-3.585.075-5.989 1.567c-.225.14-.519.07-.659-.154-.14-.225-.07-.519.154-.659 1.4-.868 2.946-1.297 4.206-1.509-.074-.236-.14-.386-.145-.398-.083-.184-.273-.3-.475-.28-.127.01-3.139.269-5.069 1.822C3.015 6.625 1 12.073 1 16.783c0 .083.022.165.063.237 1.391 2.443 5.185 3.083 6.05 3.111h.015c.153 0 .297-.073.387-.197l.875-1.202c-2.359-.61-3.564-1.645-3.634-1.706-.198-.175-.217-.477-.042-.675.175-.198.476-.217.674-.043.029.026 2.248 1.909 6.612 1.909 4.372 0 6.591-1.891 6.613-1.91.198-.172.5-.154.674.045.174.198.155.499-.042.673-.07.062-1.275 1.096-3.634 1.706l.875 1.202c.09.124.234.197.387.197h.015c.865-.027 4.659-.667 6.05-3.111.04-.072.062-.153.062-.236 0-4.71-2.015-10.158-3.048-11.111zM8.891 14.87c-.924 0-1.674-.857-1.674-1.913s.749-1.913 1.674-1.913 1.674.857 1.674 1.913-.749 1.913-1.674 1.913zm6.218 0c-.924 0-1.674-.857-1.674-1.913s.749-1.913 1.674-1.913c.924 0 1.674.857 1.674 1.913s-.75 1.913-1.674 1.913z"
              />
            </svg>
            <h3 class="text-lg font-bold tracking-tight text-base-content-highlight">
              {{ $t('pages.premium.dashboard.discordRoleName') }}
            </h3>
          </div>
          <p class="text-sm">{{ $t('pages.premium.dashboard.discordRoleDescription') }}</p>
        </NuxtLink>
      </div>
    </section>

    <!-- Support & Subscription Management -->
    <section class="mt-8 mb-8 border-t border-base-0/10 pt-6">
      <div class="mb-4">
        <h2 class="text-xl font-bold text-base-content-highlight">
          {{ $t('pages.premium.dashboard.billingTitle') }}
        </h2>
        <p class="mt-1 text-sm text-base-content">
          {{ $t('pages.premium.dashboard.billingDescription') }}
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <button
          class="inline-flex items-center justify-center rounded-md border border-base-0/20 px-4 py-2 text-sm font-medium transition-all duration-200 hover:hover-bg-util focus-visible:focus-outline-util"
          type="button"
          @click="onManageSubscriptionClick"
        >
          {{ $t('pages.premium.dashboard.cancelOrManageSubscription') }}
        </button>

        <NuxtLink
          class="inline-flex items-center justify-center rounded-md border border-base-0/20 px-4 py-2 text-sm font-medium transition-all duration-200 hover:hover-bg-util focus-visible:focus-outline-util"
          :href="`mailto:${project.email}`"
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          {{ $t('pages.premium.dashboard.contactSupport') }}
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
