<template>
  <!-- Source -->
  <div v-if="source" class="w-full text-center p-1">
    <!-- If text is an Url then make it linkable -->
    <a
      v-if="isUrl"
      :href="source"
      class="inline-flex"
      rel="noreferrer noopener nofollow"
      target="_blank"
    >
      <p class="color-util" v-text="'Source'" />

      <!-- Link Icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        opacity="0.8"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon text-default w-5 h-5 ml-2"
      >
        <path
          d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
        />
      </svg>
    </a>

    <!-- If the text is not a url then just show the text -->
    <p v-else title="Source" v-text="source" />
  </div>
</template>

<script>
export default {
  name: 'PostSource',

  props: {
    source: {
      type: String,
      default: '',
    },
  },

  computed: {
    isUrl() {
      return this.source.startsWith('http', 'www')
    },
  },
}
</script>
