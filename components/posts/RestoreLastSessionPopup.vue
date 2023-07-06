<script setup>
  import { useRestoreLastSessionPopup } from '~/composables/useRestoreLastSessionPopup'
  import { toast } from 'vue-sonner'
  import qs from 'qs'
  import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

  const router = useRouter()

  const { isPremium } = useUserData()
  const { lastPostsPage, isMenuActive, toggleMenu } = useRestoreLastSessionPopup()

  const bodyText = computed(() => {
    if (!lastPostsPage.value) {
      return null
    }

    /**
     * This is a fix, because using router.resolve() does not parse with `qs.parse()`
     */
    const lastPostsPageQuery = qs.parse(lastPostsPage.value)

    let text = `Get back`

    if (lastPostsPageQuery.page) {
      text += ` to page ${lastPostsPageQuery.page}`
    }

    // Use "to" or "of" depending on the page
    if (lastPostsPageQuery.page) {
      text += ` of`
    } else {
      text += ` to`
    }

    text += ` posts`

    if (lastPostsPageQuery.tags?.length) {
      const tags = lastPostsPageQuery.tags.split('|')

      text += ` tagged with ${tags.join(', ')}`
    }

    if (lastPostsPageQuery.filter) {
      const filters = Object.keys(lastPostsPageQuery.filter)

      text += `, and ${filters.join(', ')} filter`

      if (filters.length > 1) {
        text += 's'
      }
    }

    return text
  })

  function onClick() {
    if (!isPremium.value) {
      toast.error('[Premium feature] Restore last session is only available for Premium users')
      return
    }

    const lastPostsPageRoute = router.resolve(lastPostsPage.value)

    const lastPostsPageUrl = new URL(lastPostsPageRoute.fullPath, window.location.origin)

    window.location.assign(lastPostsPageUrl.toString())
  }
</script>

<template>
  <TransitionRoot
    :show="isMenuActive && lastPostsPage != null"
    as="template"
  >
    <Dialog
      as="div"
      class="relative z-20"
      @close="toggleMenu(false)"
    >
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-base-1000/80 backdrop-blur transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-base-1000 px-4 pb-4 pt-5 text-left shadow-xl ring-1 ring-base-0/10 transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6"
            >
              <!-- TODO: Add dismiss button -->
              <!-- TODO: Add dismiss forever button in dropdown -->
              <div>
                <DialogTitle
                  as="h3"
                  class="text-base font-medium leading-6 tracking-tight text-base-content-highlight"
                >
                  Continue where you left off?
                </DialogTitle>

                <div class="mt-1 text-sm">
                  {{ bodyText }}
                </div>
              </div>

              <div class="mt-5 sm:mt-6">
                <button
                  class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util w-full rounded-md px-3 py-2 text-sm shadow-sm ring-1 ring-base-0/20"
                  type="button"
                  @click="onClick"
                >
                  Continue
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
