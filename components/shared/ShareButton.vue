<script lang="ts" setup>
  import * as Sentry from '@sentry/nuxt'
  import { ShareIcon } from '@heroicons/vue/24/outline'

  interface ShareButtonProps {
    title: string
    text?: string
    url?: string
  }

  const props = defineProps<ShareButtonProps>()

  async function share() {
    if (!window.navigator.share) {
      console.debug('Share is not supported on this browser')
      return
    }

    const url = props.url ?? window.location.href

    let text =
      //
      props.title +
      '\n' +
      //
      url +
      '\n\n' +
      //
      props.text +
      '\n\n'

    // Should look like this:
    /**
     *  <title>
     *  <url>
     *
     *  <text>
     *
     *  <url>
     */

    try {
      await window.navigator.share({
        title: props.title,
        text: text,
        url: url
      })
    } catch (error) {
      Sentry.captureException(error)
    }
  }
</script>

<template>
  <button
    class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util rounded-md p-3"
    type="button"
    @click="share"
  >
    <span class="sr-only"> Share page</span>

    <ShareIcon class="h-5 w-5" />
  </button>
</template>
