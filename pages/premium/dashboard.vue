<script lang="ts" setup>
  import { ArrowLeftOnRectangleIcon } from '@heroicons/vue/24/solid'
  import { toast } from 'vue-sonner'
  import { doesBrowserHaveOldVersionState } from '~/assets/js/BackupHelper'

  const { user, logout: _signOut } = useAuth()

  const links = [
    {
      name: 'Saved posts',
      description: 'Save posts to your device and enjoy them later',
      href: '/premium/saved-posts/r34.app'
    },
    {
      name: 'Tag collections',
      description: 'Create lists of tags to quickly search or filter posts',
      href: '/premium/tag-collections'
    },
    {
      name: 'Additional Boorus',
      description: 'Browse posts from other Boorus',
      href: '/premium/additional-boorus'
    },
    {
      name: 'Backup & Restore',
      description: 'Backup your saved posts, tag collections and settings',
      href: '/premium/backup'
    }
  ]

  if (doesBrowserHaveOldVersionState()) {
    links.unshift({
      name: '⚠ Migrate old data ⚠',
      description: 'Migrate your old saved posts, tag collections, etc',
      href: '/premium/migrate-old-data'
    })
  }

  async function signOut() {

    let authCookie
    authCookie = useCookie('auth.strategy')
    authCookie.value = undefined

    authCookie = useCookie('auth._token.local')
    authCookie.value = undefined
    authCookie = useCookie('auth._token_expiration.local')
    authCookie.value = undefined

    authCookie = useCookie('auth._refresh_token.local')
    authCookie.value = undefined
    authCookie = useCookie('auth._refresh_token_expiration.local')
    authCookie.value = undefined

    // Log out from API
    // TODO: Restore when it works
    // await _signOut()

    window.location.reload()
  }

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

  definePageMeta({ middleware: 'auth' })
</script>

<template>
  <!-- Sign out -->
  <SafeTeleport to="#navbar-actions">
    <button
      class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util relative rounded-md p-2"
      type="button"
      @click="signOut"
    >
      <span class="sr-only">Sign out</span>

      <ArrowLeftOnRectangleIcon class="h-6 w-6 text-base-content-highlight" />
    </button>
  </SafeTeleport>

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
            {{ user.email }}
          </span>
        </p>
      </template>
    </PageHeader>

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
          class="hover:hover-bg-util focus-visible:focus-outline-util block max-w-[95%] rounded-md border border-base-0/20 px-4 py-3"
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
    <section class="absolute inset-x-0 bottom-0 w-full p-4 text-center">
      <NuxtLink
        class="hover:hover-text-util focus-visible:focus-outline-util underline"
        href="https://app.gumroad.com/library?query=Rule+34+App"
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        Manage subscription
      </NuxtLink>
    </section>
  </main>
</template>
