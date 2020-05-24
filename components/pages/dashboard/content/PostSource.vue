<template>
  <!-- Source -->
  <div v-if="source.length" class="w-full text-center p-1">
    <!-- If text is an Url then make it linkable -->
    <a
      v-if="isUrl"
      :href="source[0]"
      class="inline-flex"
      rel="noreferrer noopener nofollow"
      target="_blank"
    >
      <p class="color-util" v-text="'Source'" />

      <!-- Link Icon -->
      <ExternalLinkIcon class="icon text-default w-5 h-5 ml-2" />
    </a>

    <!-- If the text is not a url then just show the text -->
    <p v-else title="Source" v-text="source[0]" />
  </div>
</template>

<script>
import { ExternalLinkIcon } from 'vue-feather-icons'

export default {
  name: 'PostSource',

  components: { ExternalLinkIcon },

  props: {
    source: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    isUrl() {
      return this.source[0].startsWith('http', 'www')
    },
  },
}
</script>
