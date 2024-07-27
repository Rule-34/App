<script lang="ts" setup>
  import { ArrowLeftOnRectangleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'
  import { toast } from 'vue-sonner'

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

  const platformOfPurchase = computed(() => {
    if (!license.value) {
      return null
    }

    switch (true) {
      case license.value.startsWith('SLX-'):
        return 'Sellix'

      case license.value.startsWith('PATREON-'):
        return 'Patreon'

      case license.value.length === 35:
        return 'Gumroad'

      default:
        throw new Error('Unknown license origin')
    }
  })

  const manageSubscriptionLink = computed(() => {
    if (!platformOfPurchase.value) {
      return null
    }

    switch (platformOfPurchase.value) {
      case 'Sellix':
        return 'https://alejandroakbal.mysellix.io/customer/auth'

      case 'Patreon':
        return 'https://www.patreon.com/r34app/membership'

      case 'Gumroad':
        return 'https://app.gumroad.com/library?query=Rule+34+App'

      default:
        throw new Error('Unknown platform of purchase')
    }
  })

  onNuxtReady(() => {
    const route = useRoute()
    const message = route.query.message

    if (message) {
      toast.success(message)
    }
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

        <ArrowLeftOnRectangleIcon class="h-6 w-6 text-base-content-highlight" />
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
            class="inline-flex items-center rounded-md bg-primary-400/10 px-2 py-1 text-sm font-medium text-primary-400 ring-1 ring-inset ring-primary-400/20"
          >
            {{ email || '?' }}
          </span>
        </p>
      </template>
    </PageHeader>

    <!-- TODO: Show if the user is premium -->
    <div
      v-if="!isPremium"
      class="mt-4 text-pretty text-sm text-base-content-highlight"
    >
      <div class="mb-2 flex items-center gap-1">
        <ExclamationTriangleIcon class="inline h-6 w-6 text-base-content-highlight" />

        <h2 class="text-base underline">Your subscription has expired</h2>
      </div>

      <p>Your account is in a read-only state, you can still view your saved posts, but you can't create new ones</p>

      <p>To continue enjoying Premium features, subscribe again</p>

      <NuxtLink
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util mt-4 flex items-center justify-center rounded-md px-3 py-1.5 text-base ring-1 ring-base-0/20 md:inline-flex"
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
          class="hover:hover-bg-util focus-visible:focus-outline-util block w-full rounded-md border border-base-0/20 px-4 py-3"
        >
          <h2 class="text-lg font-bold tracking-tight text-base-content-highlight">
            {{ link.name }}
          </h2>

          <p class="text-sm">
            {{ link.description }}
          </p>
        </NuxtLink>

        <!-- Feedback -->
        <!-- TODO: add more distinction -->
        <NuxtLink
          class="hover:hover-bg-util focus-visible:focus-outline-util block max-w-[95%] rounded-md rounded-br-3xl border border-base-0/20 px-4 py-3"
          href="https://forms.gle/9FAZRegzJ8VAzT5F9"
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          <h2 class="text-lg font-bold tracking-tight text-base-content-highlight">Feedback</h2>

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

      <NuxtLink
        :href="manageSubscriptionLink"
        class="hover:hover-text-util focus-visible:focus-outline-util underline"
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        Manage subscription
      </NuxtLink>
    </section>
  </main>
</template>
