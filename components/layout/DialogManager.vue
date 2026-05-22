<script lang="ts" setup>
  const { pendingDialog, closeDialog } = useDialogManagerState()

  const isDialogReady = ref(false)
  const isNuxtReady = ref(false)
  let dialogReadyTimer: ReturnType<typeof window.setTimeout> | undefined

  onNuxtReady(() => {
    isNuxtReady.value = true
  })

  const dialogs = {
    installPwa: {
      component: resolveComponent('LazyPwaPrompt'),
      closeableFromBackground: false
    },
    feedback: {
      component: resolveComponent('LazyFeedbackPrompt'),
      closeableFromBackground: false
    },
    newsletter: {
      component: resolveComponent('LazyNewsletterPrompt'),
      closeableFromBackground: false
    },
    review: {
      component: resolveComponent('LazyReviewPrompt'),
      closeableFromBackground: false
    },
    premium: {
      component: resolveComponent('LazyPremiumPrompt'),
      closeableFromBackground: true
    }
  }

  function clearDialogReadyTimer() {
    if (dialogReadyTimer === undefined) {
      return
    }

    window.clearTimeout(dialogReadyTimer)
    dialogReadyTimer = undefined
  }

  watch(
    [isNuxtReady, pendingDialog],
    ([ready, dialog]) => {
      clearDialogReadyTimer()
      isDialogReady.value = false

      if (!ready || !dialog) {
        return
      }

      if (dialog === 'premium') {
        isDialogReady.value = true
        return
      }

      dialogReadyTimer = window.setTimeout(() => {
        isDialogReady.value = true
      }, 1000 * 3)
    },
    { immediate: true }
  )

  onBeforeUnmount(clearDialogReadyTimer)

  const dialog = computed(() => {
    const currentDialog = pendingDialog.value

    return currentDialog ? dialogs[currentDialog] : undefined
  })

  function closeCurrentDialog() {
    isDialogReady.value = false
    closeDialog()
  }
</script>

<template>
  <HeadlessTransitionRoot
    :show="dialog != undefined && isDialogReady"
    as="template"
  >
    <HeadlessDialog
      as="div"
      class="relative z-10"
      @close="dialog?.closeableFromBackground ? closeCurrentDialog() : null"
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
        <div class="bg-base-1000/80 fixed inset-0 backdrop-blur-sm transition-opacity" />
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
              class="bg-base-1000 ring-base-0/10 relative w-full transform overflow-hidden rounded-lg px-4 pt-5 pb-4 text-left shadow-xl ring-1 transition-all sm:my-8 sm:max-w-2xl sm:p-6"
            >
              <component
                :is="dialog?.component"
                :close="closeCurrentDialog"
              />
            </HeadlessDialogPanel>
          </HeadlessTransitionChild>
        </div>
      </div>
    </HeadlessDialog>
  </HeadlessTransitionRoot>
</template>
