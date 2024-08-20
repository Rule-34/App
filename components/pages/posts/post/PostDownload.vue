<script lang="ts" setup>
  import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
  import { toast } from 'vue-sonner'
  import type { FetchError } from 'ofetch'

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

    const { proxiedUrl } = useProxyHelper(props.mediaUrl)

    toast.promise(
      $fetch.raw(proxiedUrl.value, {
        responseType: 'blob'
      }),

      {
        loading: `Downloading "${props.mediaName}"…`,

        success(response) {
          const FILE_EXTENSION = response.headers.get('content-type').split('/')[1]

          const FILE_NAME = props.mediaName + '.' + FILE_EXTENSION

          downloadBlobToDevice(response._data, FILE_NAME)

          return `Downloaded "${props.mediaName}"`
        },

        error(error: FetchError) {
          return `Failed to download "${props.mediaName}": ${error.message}`
        }
      }
    )
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
