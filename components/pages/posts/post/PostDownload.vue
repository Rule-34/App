<template>
  <div>
    <template v-if="isUserPremium">

      <button class="flex items-center gap-2 my-2 link" type="button" @click="downloadMedia">

        <DownloadIcon class="w-5 h-5 icon" />

        Download
      </button>
    </template>

    <template v-else>
      <NuxtLink class="flex items-center gap-2 my-2 link" to="/premium">

        <DownloadIcon class="w-5 h-5 icon" />

        Download
      </NuxtLink>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { DownloadIcon } from 'vue-feather-icons'
import { ProxyHelper } from '~/assets/js/ProxyHelper'

export default {

  components: { DownloadIcon },

  props: {
    mediaName: {
      type: String,
      required: true
    },
    mediaUrl: {
      type: String,
      required: true
    }
  },

  computed: {
    ...mapGetters('premium', ['isUserPremium'])
  },

  methods: {
    ...mapActions([
      'simpleFetch',
      'errorManager'
    ]),

    downloadBlobToDevice(blob, fileName) {
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
    },

    async fetchUrlIntoBlob() {
      const PROXIED_MEDIA_URL = ProxyHelper.proxyUrl(this.mediaUrl)

      const RESPONSE = await this.simpleFetch({
          url: PROXIED_MEDIA_URL,
          options: {
            responseType: 'blob',
          }
        }
      )

      const RESPONSE_BLOB = RESPONSE.data

      return { RESPONSE, RESPONSE_BLOB }
    },

    async downloadMedia() {
      try {

        const { RESPONSE, RESPONSE_BLOB } = await this.fetchUrlIntoBlob()

        const FILE_EXTENSION = RESPONSE.headers['content-type'].split('/')[1]

        const FILE_NAME = this.mediaName + '.' + FILE_EXTENSION

        this.downloadBlobToDevice(RESPONSE_BLOB, FILE_NAME)

      } catch (error) {

        this.errorManager({
          operation: 'set',
          value: error,
          message: `Could not download post: "${ error.message }"`
        })
      }

    }
  }
}
</script>
