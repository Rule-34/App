<script lang="ts" setup>
  import * as Sentry from '@sentry/nuxt'
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
      props.title +
      '\n' +
      //
      url

    if (props.text) {
      text += '\n\n' + props.text
    }

    if ('share' in window.navigator) {
      await shareViaNavigator(props.title, text, url)
    } else {
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
    await window.navigator.share({
      title,
      text,
      url
    })
  }
</script>

<template>
  <button
    class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util rounded-md"
    type="button"
    @click="share"
  >
    <span class="sr-only"> Share page</span>

    <ShareIcon class="h-5 w-5" />
  </button>
</template>
