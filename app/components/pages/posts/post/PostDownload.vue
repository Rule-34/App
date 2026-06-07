<script lang="ts" setup>
  import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
  import { proxyUrl } from '~/assets/js/proxy'
  import { premiumPromotionIndices } from '~/composables/usePremiumDialog'

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

      currentIndex.value = premiumPromotionIndices.downloadPost
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
    :aria-label="$t('common.downloadPost')"
    class="group rounded-md px-1.5 py-1 hover:hover-bg-util focus-visible:focus-outline-util"
    type="button"
    @click="downloadMedia"
  >
    <ArrowDownTrayIcon
      aria-hidden="true"
      class="h-5 w-5 text-base-content group-hover:hover-text-util"
    />
  </button>
</template>
