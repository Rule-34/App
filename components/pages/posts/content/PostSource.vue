<template>
  <div class="w-full p-1 text-center">
    <template v-if="isUrl">
      <!-- If text is an Url then make it linkable -->
      <a
        :href="source[0]"
        class="inline-flex"
        rel="noopener nofollow"
        target="_blank"
      >
        <p class="color-util">
          {{ sourceText }}
        </p>

        <!-- Icon -->
        <ExternalLinkIcon class="w-5 h-5 ml-2 icon text-default" />
      </a>
    </template>

    <template v-else>
      <!-- If the text is not a url then just show the text -->
      <p title="Source">{{ sourceText }}</p>
    </template>
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

    sourceText() {
      // Return only the domain of the Url
      if (this.isUrl) {
        return new URL(this.source[0]).hostname
      }

      // Return the entire source as it's text
      else {
        return this.source[0]
      }
    },
  },
}
</script>
