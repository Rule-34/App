<script lang="ts" setup>
  import { ShareIcon } from '@heroicons/vue/24/outline'
  import { toast } from 'vue-sonner'

  interface ShareButtonProps {
    title: string
    text?: string
    url?: string
  }

  const props = defineProps<ShareButtonProps>()

  async function share() {
    const url = props.url ?? window.location.href

    let text =
      //
      props.title

    if (props.text) {
      text += '\n\n' + props.text
    }

    if ('share' in window.navigator) {
      text += '\n\n'

      await shareViaNavigator(props.title, text, url)
    } else {
      text += '\n\n' + url

      await copyToClipboard(text)
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link to clipboard')
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
    aria-label="Share page"
    class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util rounded-md"
    type="button"
    @click="share"
  >
    <ShareIcon class="h-5 w-5" />
  </button>
</template>
