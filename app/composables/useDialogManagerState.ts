export type DialogManagerDialog = 'premium' | 'installPwa' | 'feedback' | 'newsletter' | 'review'
type AutomaticDialog = Exclude<DialogManagerDialog, 'premium'>

export function resolvePendingDialog(
  isPremiumDialogOpen: boolean,
  automaticDialog: AutomaticDialog | undefined,
  hasConsumedAutomaticDialog: boolean
): DialogManagerDialog | undefined {
  if (isPremiumDialogOpen) {
    return 'premium'
  }

  return hasConsumedAutomaticDialog ? undefined : automaticDialog
}

export function useDialogManagerState() {
  const { timesTheAppHasBeenOpened, promptInstallPwa, promptFeedback, promptNewsletter, promptReview } =
    useAppStatistics()
  const { open: isPremiumDialogOpen } = usePremiumDialog()
  const isStandaloneDisplayMode = useState('isStandaloneDisplayMode', () => false)

  if (import.meta.client) {
    onMounted(() => {
      isStandaloneDisplayMode.value = window.matchMedia('(display-mode: standalone)').matches
    })
  }

  const hasConsumedAutomaticDialog = useState('dialog-manager-has-consumed-automatic', () => false)
  const automaticDialog = computed<AutomaticDialog | undefined>(() => {
    if (timesTheAppHasBeenOpened.value >= 3 && !promptInstallPwa.value && !isStandaloneDisplayMode.value) {
      return 'installPwa'
    }

    if (timesTheAppHasBeenOpened.value >= 6 && !promptFeedback.value) {
      return 'feedback'
    }

    if (timesTheAppHasBeenOpened.value >= 9 && !promptNewsletter.value) {
      return 'newsletter'
    }

    if (timesTheAppHasBeenOpened.value >= 12 && !promptReview.value) {
      return 'review'
    }
  })
  const pendingDialog = computed(() =>
    resolvePendingDialog(isPremiumDialogOpen.value, automaticDialog.value, hasConsumedAutomaticDialog.value)
  )

  function closeDialog(dialog = pendingDialog.value) {
    switch (dialog) {
      case 'premium':
        isPremiumDialogOpen.value = false
        break

      case 'installPwa':
        promptInstallPwa.value = true
        hasConsumedAutomaticDialog.value = true
        break

      case 'feedback':
        promptFeedback.value = true
        hasConsumedAutomaticDialog.value = true
        break

      case 'newsletter':
        promptNewsletter.value = true
        hasConsumedAutomaticDialog.value = true
        break

      case 'review':
        promptReview.value = true
        hasConsumedAutomaticDialog.value = true
        break
    }
  }

  return {
    pendingDialog,
    closeDialog
  }
}
