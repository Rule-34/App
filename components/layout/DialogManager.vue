<script lang="ts" setup>
  import { watchOnce } from '@vueuse/core'

  const open = ref(false)

  const dialogs = [
    {
      condition: () => {
        const { timesTheAppHasBeenOpened, promptInstallPwa } = useAppStatistics()

        if (promptInstallPwa.value) {
          return false
        }

        if (timesTheAppHasBeenOpened.value < 1) {
          return false
        }

        if (window.matchMedia('(display-mode: standalone)').matches) {
          return false
        }

        return true
      },
      component: resolveComponent('PWA')
    }
  ]

  const dialog = computed(() => {
    return dialogs.find((dialog) => dialog.condition())?.component
  })

  watchOnce(
    dialog,
    () => {
      if (dialog.value) {
        // Show after X seconds
        setTimeout(() => {
          open.value = true
        }, 1000 * 1.33)
      }
    },
    {
      immediate: true
    }
  )
</script>

<template>
  <HeadlessTransitionRoot
    :show="open"
    as="template"
  >
    <HeadlessDialog
      as="div"
      class="relative z-10"
      @close="open = false"
    >
      <!-- Background -->
      <HeadlessTransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-base-1000/80 backdrop-blur transition-opacity" />
      </HeadlessTransitionChild>

      <!-- Body -->
      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <HeadlessTransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <HeadlessDialogPanel
              class="relative transform overflow-hidden rounded-lg bg-base-1000 px-4 pb-4 pt-5 text-left shadow-xl ring-1 ring-base-0/10 transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            >
              <component
                :is="dialog"
                v-model="open"
              />
            </HeadlessDialogPanel>
          </HeadlessTransitionChild>
        </div>
      </div>
    </HeadlessDialog>
  </HeadlessTransitionRoot>
</template>
