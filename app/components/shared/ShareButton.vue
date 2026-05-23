<script lang="ts" setup>
  import { ShareIcon } from '@heroicons/vue/24/outline'

  interface ShareButtonProps {
    title: string
    text?: string
    url?: string
  }

  const props = defineProps<ShareButtonProps>()

  const { t } = useI18n()
  const { toast } = useLazyToast()

  async function share() {
    const url = props.url ?? (import.meta.client ? window.location.href : '')

    let text =
      //
      props.title

    if (props.text) {
      text += '\n\n' + props.text
    }

    if ('share' in window.navigator) {
      text += '\n\n'

      try {
        await shareViaNavigator(props.title, text, url)
        return
      } catch {
        // Fall back to clipboard when the Web Share API is unavailable for the current payload.
      }
    }

    text += '\n\n' + url

    await copyToClipboard(text)
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('toasts.linkCopiedToClipboard'))
    } catch {
      toast.error(t('toasts.failedToCopyLink'))
    }
  }

  async function shareViaNavigator(title: string, text: string, url: string) {
    try {
      await window.navigator.share({
        title,
        text,
        url
      })
    } catch (err) {
      // Ignore AbortError which happens when user cancels the share dialog
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        throw err
      }
    }
  }
</script>

<template>
  <button
    :aria-label="t('common.sharePage')"
    class="rounded-md hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
    type="button"
    @click="share"
  >
    <ShareIcon class="h-5 w-5" />
  </button>
</template>
