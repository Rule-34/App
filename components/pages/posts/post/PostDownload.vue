<template>
  <div>
    <template v-if="isUserPremium">

      <a :href="mediaUrl" class="flex items-center gap-2 my-2 link" download="" target="_blank">

        <DownloadIcon class="w-5 h-5 icon"/>

        Download
      </a>
    </template>

    <template v-else>
      <NuxtLink class="flex items-center gap-2 my-2 link" to="/premium">

        <DownloadIcon class="w-5 h-5 icon"/>

        Download
      </NuxtLink>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { DownloadIcon } from 'vue-feather-icons'

export default {

  components: { DownloadIcon },

  props: {
    mediaUrl: {
      type: String,
      required: true,
    },
  },

  computed: {
    ...mapGetters('premium', ['isUserPremium']),
  },
}
</script>
