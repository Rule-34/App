<script setup>
  import { useRestoreLastSessionPopup } from '~/composables/useRestoreLastSessionPopup'
  import { toast } from 'vue-sonner'
  import qs from 'qs'
  import { TransitionChild, TransitionRoot } from '@headlessui/vue'
  import { useInterval } from '@vueuse/core'
  import { XMarkIcon } from '@heroicons/vue/24/outline'

  const router = useRouter()

  const { isPremium } = useUserData()
  const { lastPostsPage, isMenuActive, toggleMenu } = useRestoreLastSessionPopup()

  const { counter, pause: pauseCounter, resume: resumeCounter } = useInterval(1000, { controls: true })

  const counterPercentage = computed(() => {
    const maxTime = 10

    if (counter.value >= maxTime) {
      return 100
    }

    return Math.round((counter.value / maxTime) * 100)
  })

  // Close the popup after 10 seconds
  watch(counter, () => {
    if (counterPercentage.value === 100) {
      pauseCounter()
      toggleMenu(false)
    }
  })

  const description = computed(() => {
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

  function onContinueClick() {
    if (!isPremium.value) {
      toast.error('[Premium feature] Restore last session is only available for Premium users')
      return
    }

    const lastPostsPageRoute = router.resolve(lastPostsPage.value)

    const lastPostsPageUrl = new URL(lastPostsPageRoute.fullPath, window.location.origin)

    window.location.assign(lastPostsPageUrl.toString())
  }

  function onCloseClick() {
    pauseCounter()
    toggleMenu(false)
  }
</script>

<template>
  <teleport to="body">
    <TransitionRoot
      :show="isMenuActive && lastPostsPage != null"
      as="template"
    >
      <div class="relative z-20">
        <!-- Container -->
        <div
          class="fixed inset-x-3 bottom-0"
          style="filter: drop-shadow(0px -33px 30px #000)"
        >
          <!-- Panel -->
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="translate-y-full"
            enter-to="translate-y-0"
            leave="ease-in duration-200"
            leave-from="translate-y-0"
            leave-to="translate-y-full"
          >
            <div class="flex min-h-full items-end justify-center text-center">
              <!-- Close button -->
              <div class="absolute -top-12 right-0 z-10 flex w-16 justify-center">
                <button
                  class="focus-visible:focus-util hover:hover-bg-util rounded-md p-2.5"
                  type="button"
                  @click="onCloseClick"
                >
                  <span class="sr-only">Close menu</span>

                  <XMarkIcon class="hover:hover-text-util h-6 w-6 text-base-content-highlight" />
                </button>
              </div>

              <div
                class="relative w-full transform overflow-hidden rounded-lg rounded-b-none bg-base-1000 p-4 text-left shadow-xl ring-1 ring-base-0/10 transition-all sm:max-w-sm sm:p-6"
                @mouseout="resumeCounter"
                @mouseover="pauseCounter"
                @touchend="resumeCounter"
                @touchstart="pauseCounter"
              >
                <!-- TODO: Add dismiss forever button in dropdown -->
                <div>
                  <h3 class="text-base font-medium leading-6 tracking-tight text-base-content-highlight">
                    Continue where you left off?
                  </h3>

                  <div class="mt-1 text-sm">
                    {{ description }}
                  </div>
                </div>

                <div class="mt-5 sm:mt-6">
                  <button
                    class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util w-full rounded-md px-3 py-2 text-sm shadow-sm ring-1 ring-base-0/20"
                    type="button"
                    @click="onContinueClick"
                  >
                    Continue
                  </button>
                </div>

                <!-- Progress -->
                <div class="absolute inset-x-0 bottom-0 h-1 w-full bg-base-950">
                  <span class="sr-only"> Percentage of time left until the popup closes </span>

                  <div
                    :style="{ width: `${counterPercentage}%` }"
                    class="h-1 bg-base-0/20 transition-all duration-300 ease-in-out"
                  />
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </TransitionRoot>
  </teleport>
</template>
