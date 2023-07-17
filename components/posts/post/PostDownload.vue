<script setup>
  import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
  import { ProxyHelper } from 'assets/js/ProxyHelper'
  import { toast } from 'vue-sonner'

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
      toast.error(
        '[Premium feature] automatically download media with the correct name & extension: rule34.xxx-123.png'
      )
      return
    }

    const proxiedUrl = ProxyHelper.proxyUrl(props.mediaUrl)

    const response = await $fetch.raw(proxiedUrl, {
      responseType: 'blob',

      onResponseError(context) {
        toast.error(`Failed to download media: ${context.error.message}`)
        throw context.error
      }
    })

    const FILE_EXTENSION = response.headers.get('content-type').split('/')[1]

    const FILE_NAME = props.mediaName + '.' + FILE_EXTENSION

    downloadBlobToDevice(response._data, FILE_NAME)
  }

  function downloadBlobToDevice(blob, fileName) {
    const BLOB_OBJECT_URL = URL.createObjectURL(blob)

    const LINK = document.createElement('a')

    LINK.href = BLOB_OBJECT_URL
    LINK.target = '_blank'
    LINK.download = fileName
    LINK.style.display = 'none'

    document.body.appendChild(LINK)
    LINK.click()
    document.body.removeChild(LINK)

    URL.revokeObjectURL(BLOB_OBJECT_URL)
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
