<script setup>
  import { ArrowUpIcon } from '@heroicons/vue/24/solid'
  import { useToggle } from '@vueuse/core'

  const [isActive, toggleIsActive] = useToggle(false)
  const userSettings = useUserSettings()

  const router = useRouter()

  const bodyText = computed(() => {
    if (!userSettings.lastPostsPage) {
      return null
    }

    const lastPostsPageRoute = router.resolve(userSettings.lastPostsPage)

    const lastPostsPageUrl = new URL(lastPostsPageRoute.fullPath, window.location.origin)

    const tags = lastPostsPageUrl.searchParams.get('tags')?.split('|')
    const page = lastPostsPageUrl.searchParams.get('page')
    const filters = lastPostsPageUrl.searchParams.get('filters')

    let text = `You were`

    if (page) {
      text += `on page ${page}`
    }

    if (tags && tags.length) {
      text += `with tags ${tags.join(', ')}`
    }

    if (filters) {
      // TODO
    }

    return text
  })

  // TODO: Only do this once, when the entire app has been booted
  onMounted(() => {
    if (!userSettings.lastPostsPage) {
      return
    }

    toggleIsActive(true)
  })

  function onClick() {
    // TODO: Navigate to userSettings.lastPostsPage while doing a full reload
    // TODO: Add analytics to URL
    // TODO: Skip if not Premium and show a Toast
  }
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="userSettings.lastPostsPage"
        class="fixed bottom-10"
      >
        <span> Restore last session? </span>

        <!--        -->

        {{ bodyText }}

        <button
          class="hover:hover-text-util hover:hover-bg-util flex h-12 w-12 items-center justify-center rounded-full bg-base-1000/60 text-base-content-highlight ring-2 ring-base-0/20 backdrop-blur"
          type="button"
          @click="onClick"
        >
          Restore

          <ArrowUpIcon class="h-6 w-6" />
        </button>
      </div>
    </transition>
  </Teleport>
</template>
