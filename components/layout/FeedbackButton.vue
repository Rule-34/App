<script lang="ts" setup>
  import { PencilSquareIcon, XMarkIcon } from '@heroicons/vue/24/outline'
  import { useStorage } from '@vueuse/core'
  import { toast } from 'vue-sonner'

  const feedbackButtonClosedCount = useStorage('feedback-button-closed-count', 0, localStorage, {
    writeDefaults: false
  })

  const isOpen = ref(false)

  // When Nuxt idle
  onNuxtReady(() => {
    isOpen.value = true
  })

  /**
   * Only show the feedback button if:
   * - The user has not closed it
   * - The user has not closed it more than 5 times
   */
  const shouldShow = computed(() => {
    return isOpen.value && feedbackButtonClosedCount.value <= 5
  })

  function onCloseClick() {
    isOpen.value = false

    feedbackButtonClosedCount.value += 1

    if (feedbackButtonClosedCount.value > 5) {
      toast.success('Got it, the feedback button will not show again')
    }
  }
</script>

<template>
  <Transition
    enter-active-class="transition ease-in-out duration-300 transform"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition ease-in-out duration-300 transform"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div
      v-if="shouldShow"
      class="fixed -right-1 bottom-24 z-10"
    >
      <div class="flex flex-col items-center justify-center gap-2">
        <NuxtLink
          class="focus-visible:focus-util hover:hover-text-util hover:hover-bg-util flex items-center justify-center gap-2 rounded-r-md bg-base-1000/60 px-0.5 py-2 shadow-lg ring-2 ring-base-0/20 backdrop-blur"
          style="writing-mode: vertical-lr; transform: rotate(180deg)"
          target="_blank"
          to="https://forms.gle/sghxKkEgaGVpp81b9"
        >
          <span class="text-sm"> Feedback </span>

          <PencilSquareIcon
            class="h-4 w-4"
            style="transform: rotate(180deg)"
          />
        </NuxtLink>

        <button
          class="focus-visible:focus-util hover:hover-text-util hover:hover-bg-util flex items-center justify-center rounded-full p-1"
          type="button"
          @click="onCloseClick"
        >
          <span class="sr-only"> Close feedback button </span>

          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>
