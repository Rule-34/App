<script lang="ts" setup>
  import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
  import { proxyUrl } from 'assets/js/proxy'

  const props = defineProps({
    mediaName: {
      type: String,
      required: true
    },

    mediaUrl: {
      type: String,
      required: true
    }
  })

  const { isPremium } = useUserData()

  async function downloadMedia() {
    if (!isPremium.value) {
      const { open: promptPremium, currentIndex } = usePremiumDialog()

      currentIndex.value = 5
      promptPremium.value = true
      return
    }

    const proxiedUrl = proxyUrl(props.mediaUrl, props.mediaName)

    const anchorElement = document.createElement('a')

    anchorElement.href = proxiedUrl
    anchorElement.target = '_blank'
    anchorElement.download = ''
    anchorElement.style.display = 'none'

    document.body.appendChild(anchorElement)
    anchorElement.click()
    document.body.removeChild(anchorElement)
  }
</script>

<template>
  <button
    class="hover:hover-bg-util focus-visible:focus-outline-util group rounded-md px-1.5 py-1"
    type="button"
    @click="downloadMedia"
  >
    <span class="sr-only"> Download post </span>

    <ArrowDownTrayIcon class="group-hover:hover-text-util h-5 w-5 text-base-content" />
  </button>
</template>
