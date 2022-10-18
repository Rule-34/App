<template>
  <div
    class="m-6 p-4 text-center text-gray-200"
    :class="{ 'material-container': renderBorders }"
  >
    <!-- Header -->
    <h1
      class="mx-auto w-max border border-white px-2 text-2xl font-bold leading-normal tracking-wide"
    >
      {{ errorTitle }}
    </h1>

    <!-- Body -->
    <p class="mt-2">
      {{ errorData }}
    </p>

    <!-- Action -->
    <template v-if="showAction">
      <slot name="customAction">
        <!-- Fallback -->
        <button type="button" class="link" @click="reload()">
          Reload the page?
        </button>
      </slot>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    errorTitle: {
      type: String,
      default: 'Error'
    },

    errorData: {
      type: String,
      default: 'Something went wrong'
    },

    showAction: {
      type: Boolean,
      default: true
    },

    renderBorders: {
      type: Boolean,
      default: true
    }
  },

  methods: {
    reload() {
      location.reload()
    }
  }
}
</script>
